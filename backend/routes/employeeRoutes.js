/*
Purpose:
Employee routes, mounted at /api/v1/emp in server.js
Every route here needs a valid JWT (router.use(authenticate) runs first)
Each route runs in order: authenticate -> (upload) -> validation rules -> validate -> controller
The upload runs before validation because multer is what reads the multipart form fields
*/

const express = require("express")
const router = express.Router()

const authenticate = require("../middleware/auth.js")
const validate = require("../middleware/validate.js")
const { uploadPicture } = require("../middleware/upload.js")
const {
    createEmployeeRules,
    updateEmployeeRules,
    employeeIdRules,
    deleteEmployeeRules,
    searchRules
} = require("../validators/employeeValidator.js")
const {
    getAllEmployees,
    searchEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController.js")


// Protect every route below this line
router.use(authenticate)


// GET http://localhost:8081/api/v1/emp/employees
router.get("/employees", getAllEmployees)

// GET http://localhost:8081/api/v1/emp/employees/search?department=...&position=...
// Must be BEFORE /employees/:eid, otherwise "search" is treated as an employee id
router.get("/employees/search", searchRules, validate, searchEmployees)

// POST http://localhost:8081/api/v1/emp/employees  (JSON or multipart/form-data)
router.post("/employees", uploadPicture, createEmployeeRules, validate, createEmployee)

// GET http://localhost:8081/api/v1/emp/employees/:eid
router.get("/employees/:eid", employeeIdRules, validate, getEmployeeById)

// PUT http://localhost:8081/api/v1/emp/employees/:eid  (JSON or multipart/form-data)
router.put("/employees/:eid", uploadPicture, updateEmployeeRules, validate, updateEmployee)

// DELETE http://localhost:8081/api/v1/emp/employees?eid=xxx
router.delete("/employees", deleteEmployeeRules, validate, deleteEmployee)


module.exports = router
