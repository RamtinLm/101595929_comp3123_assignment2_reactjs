import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Paper, Typography } from "@mui/material"
import EmployeeForm from "../components/EmployeeForm.jsx"
import { createEmployee } from "../api/employeeApi.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { getErrorMessage, getFieldErrors } from "../utils/errors.js"
import { fullName } from "../utils/format.js"

export default function AddEmployeePage() {
    const navigate = useNavigate()
    const { notify } = useNotification()

    const [submitting, setSubmitting] = useState(false)
    const [serverErrors, setServerErrors] = useState({})
    const [formError, setFormError] = useState("")

    const handleSubmit = async (values, file) => {
        setSubmitting(true)
        setServerErrors({})
        setFormError("")
        try {
            const response = await createEmployee(values, file)
            notify(`${fullName(response.data.employee)} was added`)
            navigate("/employees")
        } catch (error) {
            setServerErrors(getFieldErrors(error))
            setFormError(getErrorMessage(error, "Could not add the employee."))
            setSubmitting(false)
        }
    }

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, maxWidth: 760, mx: "auto" }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
                Add Employee
            </Typography>
            <EmployeeForm
                submitLabel="Save"
                submitting={submitting}
                serverErrors={serverErrors}
                formError={formError}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/employees")}
            />
        </Paper>
    )
}
