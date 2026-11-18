/*
Purpose:
Handles the employee routes (all protected by the auth middleware)
Ownership is enforced twice:
1. getOwnedEmployee() checks the owner and returns 404 / 403
2. Every DB query also filters by { user: req.user.id }
No try/catch needed for normal errors: Express 5 sends any thrown error to the central error handler
try/catch is only used to delete a new picture when saving the employee fails
*/

const { matchedData } = require("express-validator")
const Employee = require("../models/EmployeeModel.js")
const { getOwnedEmployee } = require("../services/employeeService.js")
const { savePicture, deletePicture } = require("../services/fileService.js")
const escapeRegex = require("../utils/escapeRegex.js")
const AppError = require("../utils/AppError.js")
const logger = require("../utils/logger.js")


// READ all employees of the logged in user
// GET http://localhost:8081/api/v1/emp/employees
const getAllEmployees = async (req, res) => {
    // Only this user's employees, newest first
    const employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 })

    res.status(200).send({
        status: true,
        message: "Employees retrieved successfully",
        count: employees.length,
        employees: employees
    })
}


// SEARCH the logged in user's employees by department and/or position
// GET http://localhost:8081/api/v1/emp/employees/search?department=Engineering&position=Developer
const searchEmployees = async (req, res) => {
    // matchedData gives the validated + trimmed values
    // (Express 5 req.query is read-only, so sanitized values are read from here)
    const { department, position } = matchedData(req, { locations: ["query"] })

    // Owner filter first, so search can never return another user's employees
    const filter = { user: req.user.id }

    // Case-insensitive partial match, user text is escaped before it becomes a regex
    if(department){
        filter.department = { $regex: escapeRegex(department), $options: "i" }
    }
    if(position){
        filter.position = { $regex: escapeRegex(position), $options: "i" }
    }

    const employees = await Employee.find(filter).sort({ created_at: -1 })

    res.status(200).send({
        status: true,
        message: employees.length > 0 ? "Employees found" : "No employees match your search",
        count: employees.length,
        employees: employees
    })
}


// CREATE a new employee for the logged in user (optional profile picture)
// POST http://localhost:8081/api/v1/emp/employees
const createEmployee = async (req, res) => {
    // Save the picture only now, after validation passed
    const picturePath = req.file ? await savePicture(req.file) : null

    let employee

    try{
        // Owner always comes from the token, never from the body
        employee = await Employee.create({
            ...req.body,
            profile_picture: picturePath,
            user: req.user.id
        })
    } catch(err){
        // For example a duplicate email (409): do not keep the picture
        await deletePicture(picturePath)
        throw err
    }

    logger.info(`Employee created: ${employee._id} by user ${req.user.id}`)

    res.status(201).send({
        status: true,
        message: "Employee created successfully",
        employee: employee
    })
}


// READ one employee by id
// GET http://localhost:8081/api/v1/emp/employees/:eid
const getEmployeeById = async (req, res) => {
    const employee = await getOwnedEmployee(req.params.eid, req.user.id)

    res.status(200).send({
        status: true,
        message: "Employee retrieved successfully",
        employee: employee
    })
}


// UPDATE one employee by id (optional new profile picture)
// PUT http://localhost:8081/api/v1/emp/employees/:eid
const updateEmployee = async (req, res) => {
    // 404 / 403 check first, so nothing is saved for another user's employee
    const existing = await getOwnedEmployee(req.params.eid, req.user.id)
    const oldPicture = existing.profile_picture

    const updates = { ...req.body }
    let newPicture = null

    if(req.file){
        newPicture = await savePicture(req.file)
        updates.profile_picture = newPicture
    }

    let updatedEmployee

    try{
        // The filter has the owner too, so this can never touch another user's employee
        // returnDocument: "after" -> send back the updated version (Mongoose 9)
        // runValidators           -> apply the schema rules on update too
        updatedEmployee = await Employee.findOneAndUpdate(
            { _id: req.params.eid, user: req.user.id },
            updates,
            { returnDocument: "after", runValidators: true }
        )
    } catch(err){
        await deletePicture(newPicture)
        throw err
    }

    // Could happen if it was deleted between the check and the update
    if(!updatedEmployee){
        await deletePicture(newPicture)
        throw new AppError(404, "Employee not found")
    }

    // New picture saved, so the old one is not needed anymore
    if(newPicture){
        await deletePicture(oldPicture)
    }

    logger.info(`Employee updated: ${updatedEmployee._id} by user ${req.user.id}`)

    res.status(200).send({
        status: true,
        message: "Employee updated successfully",
        employee: updatedEmployee
    })
}


// DELETE one employee by id (id comes from the query string)
// DELETE http://localhost:8081/api/v1/emp/employees?eid=xxx
const deleteEmployee = async (req, res) => {
    const eid = req.query.eid

    // 404 / 403 check first
    const employee = await getOwnedEmployee(eid, req.user.id)

    // The filter has the owner too, so this can never delete another user's employee
    await Employee.deleteOne({ _id: eid, user: req.user.id })

    // Remove the stored picture file too
    await deletePicture(employee.profile_picture)

    logger.info(`Employee deleted: ${eid} by user ${req.user.id}`)

    // 204 = success with no body
    res.status(204).send()
}


module.exports = {
    getAllEmployees,
    searchEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
}
