import api from "./axiosClient.js"

// Add and update always send multipart/form-data, so the picture can go with the fields
// The picture is only appended when the user picked a new one
const toFormData = (values, file) => {
    const formData = new FormData()

    Object.entries(values).forEach(([key, value]) => {
        formData.append(key, typeof value === "string" ? value.trim() : value)
    })

    if (file) {
        formData.append("profile_picture", file)
    }

    return formData
}

const employeePath = (id) => `/emp/employees/${encodeURIComponent(id)}`

// GET /api/v1/emp/employees
export const getEmployees = (signal) => api.get("/emp/employees", { signal })

// GET /api/v1/emp/employees/search?department=...&position=...
export const searchEmployees = (params, signal) => api.get("/emp/employees/search", { params, signal })

// GET /api/v1/emp/employees/:eid
export const getEmployee = (id, signal) => api.get(employeePath(id), { signal })

// POST /api/v1/emp/employees
export const createEmployee = (values, file) => api.post("/emp/employees", toFormData(values, file))

// PUT /api/v1/emp/employees/:eid
export const updateEmployee = (id, values, file) => api.put(employeePath(id), toFormData(values, file))

// DELETE /api/v1/emp/employees?eid=xxx
export const deleteEmployee = (id) => api.delete("/emp/employees", { params: { eid: id } })
