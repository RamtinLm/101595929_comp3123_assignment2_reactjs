import { useEffect, useState } from "react"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Button, Paper, Typography } from "@mui/material"
import PersonOffIcon from "@mui/icons-material/PersonOff"
import EmployeeForm from "../components/EmployeeForm.jsx"
import { EmptyState, ErrorState, LoadingState } from "../components/PageState.jsx"
import { getEmployee, updateEmployee } from "../api/employeeApi.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { getErrorMessage, getFieldErrors, isCanceled } from "../utils/errors.js"
import { fullName, toDateInputValue } from "../utils/format.js"
import { imageUrl } from "../utils/imageUrl.js"

const NOT_FOUND_STATUSES = [400, 403, 404]

export default function EditEmployeePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { notify } = useNotification()

    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [notFound, setNotFound] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [serverErrors, setServerErrors] = useState({})
    const [formError, setFormError] = useState("")

    // Load the employee to pre-fill the form
    useEffect(() => {
        const controller = new AbortController()

        const load = async () => {
            setLoading(true)
            setError("")
            setNotFound(false)
            try {
                const response = await getEmployee(id, controller.signal)
                setEmployee(response.data.employee)
            } catch (err) {
                if (isCanceled(err)) return
                if (NOT_FOUND_STATUSES.includes(err.response?.status)) setNotFound(true)
                else setError(getErrorMessage(err, "Could not load the employee."))
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        load()
        return () => controller.abort()
    }, [id, reloadKey])

    const handleSubmit = async (values, file) => {
        setSubmitting(true)
        setServerErrors({})
        setFormError("")
        try {
            const response = await updateEmployee(id, values, file)
            notify(`${fullName(response.data.employee)} was updated`)
            navigate(`/employees/${id}`)
        } catch (err) {
            if (NOT_FOUND_STATUSES.includes(err.response?.status) && !err.response?.data?.errors) {
                setNotFound(true)
                return
            }
            setServerErrors(getFieldErrors(err))
            setFormError(getErrorMessage(err, "Could not update the employee."))
            setSubmitting(false)
        }
    }

    if (loading) return <LoadingState label="Loading employee..." />

    if (notFound) {
        return (
            <EmptyState
                icon={<PersonOffIcon />}
                title="Employee not found"
                message="This employee does not exist or you do not have access to it."
                action={<Button variant="contained" component={RouterLink} to="/employees">Back to employees</Button>}
            />
        )
    }

    if (error) return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />

    const initialValues = {
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        salary: String(employee.salary),
        date_of_joining: toDateInputValue(employee.date_of_joining)
    }

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, maxWidth: 760, mx: "auto" }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
                Update Employee
            </Typography>
            <EmployeeForm
                key={employee._id}
                initialValues={initialValues}
                currentPictureUrl={imageUrl(employee.profile_picture)}
                submitLabel="Save changes"
                submitting={submitting}
                serverErrors={serverErrors}
                formError={formError}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/employees/${id}`)}
            />
        </Paper>
    )
}
