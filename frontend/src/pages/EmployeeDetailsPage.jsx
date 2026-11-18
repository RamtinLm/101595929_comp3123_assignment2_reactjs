import { useEffect, useState } from "react"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import PersonOffIcon from "@mui/icons-material/PersonOff"
import EmployeeAvatar from "../components/EmployeeAvatar.jsx"
import ConfirmDialog from "../components/ConfirmDialog.jsx"
import { EmptyState, ErrorState, LoadingState } from "../components/PageState.jsx"
import { deleteEmployee, getEmployee } from "../api/employeeApi.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { getErrorMessage, isCanceled } from "../utils/errors.js"
import { formatDate, formatDateTime, formatSalary, fullName } from "../utils/format.js"

// 400 (bad id), 403 (another user's employee) and 404 all show the same "not found" screen
const NOT_FOUND_STATUSES = [400, 403, 404]

export default function EmployeeDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { notify } = useNotification()

    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [notFound, setNotFound] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

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

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteEmployee(employee._id)
            notify(`${fullName(employee)} was deleted`)
            navigate("/employees", { replace: true })
        } catch (err) {
            notify(getErrorMessage(err, "Could not delete the employee."), "error")
            setDeleting(false)
            setConfirmOpen(false)
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

    const details = [
        ["Email", employee.email],
        ["Position", employee.position],
        ["Department", employee.department],
        ["Salary", formatSalary(employee.salary)],
        ["Date of joining", formatDate(employee.date_of_joining)],
        ["Created", formatDateTime(employee.created_at)],
        ["Last updated", formatDateTime(employee.updated_at)]
    ]

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, maxWidth: 760, mx: "auto" }}>
            <Button component={RouterLink} to="/employees" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to employees
            </Button>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "center", mb: 3 }}>
                <EmployeeAvatar employee={employee} size={128} />
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                        {fullName(employee)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: { xs: "center", sm: "flex-start" }, flexWrap: "wrap" }}>
                        <Chip label={employee.position} color="primary" variant="outlined" />
                        <Chip label={employee.department} color="secondary" variant="outlined" />
                    </Stack>
                </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box component="dl" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" }, rowGap: 1.5, columnGap: 2, m: 0 }}>
                {details.map(([label, value]) => (
                    <Box key={label} sx={{ display: "contents" }}>
                        <Typography component="dt" sx={{ color: "text.secondary", fontWeight: 600 }}>{label}</Typography>
                        <Typography component="dd" sx={{ m: 0, wordBreak: "break-word" }}>{value}</Typography>
                    </Box>
                ))}
            </Box>

            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end", mt: 4 }}>
                <Button color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => setConfirmOpen(true)}>
                    Delete
                </Button>
                <Button variant="contained" startIcon={<EditIcon />} component={RouterLink} to={`/employees/${employee._id}/edit`}>
                    Edit
                </Button>
            </Stack>

            <ConfirmDialog
                open={confirmOpen}
                title="Delete employee?"
                message={`${fullName(employee)} will be permanently deleted. This cannot be undone.`}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </Paper>
    )
}
