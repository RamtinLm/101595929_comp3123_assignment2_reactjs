import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
    Box, Button, IconButton, LinearProgress, Paper, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip, Typography
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import GroupOffIcon from "@mui/icons-material/GroupOff"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import EmployeeAvatar from "../components/EmployeeAvatar.jsx"
import SearchBar from "../components/SearchBar.jsx"
import ConfirmDialog from "../components/ConfirmDialog.jsx"
import { EmptyState, ErrorState, LoadingState } from "../components/PageState.jsx"
import { deleteEmployee, getEmployees, searchEmployees } from "../api/employeeApi.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { useDebounce } from "../hooks/useDebounce.js"
import { getErrorMessage, isCanceled } from "../utils/errors.js"
import { fullName } from "../utils/format.js"

const EMPTY_SEARCH = { department: "", position: "" }

// On phones some columns are hidden so the table fits the screen
const hideOnMobile = { display: { xs: "none", sm: "table-cell" } }
const hideOnTablet = { display: { xs: "none", md: "table-cell" } }
const onlyOnMobile = { display: { xs: "block", sm: "none" } }
const hideTextOnMobile = { display: { xs: "none", sm: "block" } }

export default function EmployeeListPage() {
    const { notify } = useNotification()

    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState(EMPTY_SEARCH)
    const [reloadKey, setReloadKey] = useState(0)
    const [toDelete, setToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)

    // Wait 400 ms after typing stops before calling the API
    const debouncedSearch = useDebounce(search, 400)
    const department = debouncedSearch.department.trim()
    const position = debouncedSearch.position.trim()
    const isSearching = Boolean(department || position)

    // Load the full list, or call the backend search API when a search term is set
    useEffect(() => {
        const controller = new AbortController()

        const load = async () => {
            setLoading(true)
            setError("")
            try {
                let response
                if (isSearching) {
                    const params = {}
                    if (department) params.department = department
                    if (position) params.position = position
                    response = await searchEmployees(params, controller.signal)
                } else {
                    response = await getEmployees(controller.signal)
                }
                setEmployees(response.data.employees)
            } catch (err) {
                if (isCanceled(err)) return
                setError(getErrorMessage(err, "Could not load employees."))
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        load()

        // Cancel the old request if the search changes or the page closes
        return () => controller.abort()
    }, [department, position, isSearching, reloadKey])

    const handleSearchChange = (event) => {
        const { name, value } = event.target
        setSearch((current) => ({ ...current, [name]: value }))
    }

    const handleClearSearch = () => setSearch(EMPTY_SEARCH)

    const handleConfirmDelete = async () => {
        const employee = toDelete
        setDeleting(true)
        try {
            await deleteEmployee(employee._id)
            setEmployees((list) => list.filter((item) => item._id !== employee._id))
            notify(`${fullName(employee)} was deleted`)
        } catch (err) {
            notify(getErrorMessage(err, "Could not delete the employee."), "error")
        } finally {
            setDeleting(false)
            setToDelete(null)
        }
    }

    const renderContent = () => {
        if (loading && employees.length === 0) {
            return <LoadingState label={isSearching ? "Searching..." : "Loading employees..."} />
        }

        if (error) {
            return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
        }

        if (employees.length === 0 && isSearching) {
            return (
                <EmptyState
                    icon={<SearchOffIcon />}
                    title="No employees match your search"
                    message="Try a different department or position."
                    action={<Button variant="outlined" onClick={handleClearSearch}>Clear search</Button>}
                />
            )
        }

        if (employees.length === 0) {
            return (
                <EmptyState
                    icon={<GroupOffIcon />}
                    title="No employees yet"
                    message="Add your first employee to get started."
                    action={
                        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/employees/add">
                            Add Employee
                        </Button>
                    }
                />
            )
        }

        return (
            <TableContainer component={Paper} variant="outlined">
                {loading && <LinearProgress aria-label="Updating list" />}
                <Table aria-label="Employees">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 72 }}>Photo</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell sx={hideOnMobile}>Position</TableCell>
                            <TableCell sx={hideOnTablet}>Department</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => {
                            const name = fullName(employee)
                            return (
                                <TableRow key={employee._id} hover>
                                    <TableCell>
                                        <EmployeeAvatar employee={employee} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", overflowWrap: "anywhere", ...hideTextOnMobile }}>
                                            {employee.email}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", ...onlyOnMobile }}>
                                            {employee.position}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={hideOnMobile}>{employee.position}</TableCell>
                                    <TableCell sx={hideOnTablet}>{employee.department}</TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                        <Tooltip title="View">
                                            <IconButton component={RouterLink} to={`/employees/${employee._id}`} aria-label={`View ${name}`} color="primary">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton component={RouterLink} to={`/employees/${employee._id}/edit`} aria-label={`Edit ${name}`} color="secondary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => setToDelete(employee)} aria-label={`Delete ${name}`} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    const countLabel = isSearching
        ? `${employees.length} result${employees.length === 1 ? "" : "s"}`
        : `${employees.length} employee${employees.length === 1 ? "" : "s"}`

    return (
        <Box>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, mb: 3 }}
            >
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Employees</Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                        {loading || error ? " " : countLabel}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/employees/add">
                    Add Employee
                </Button>
            </Stack>

            <SearchBar values={search} onChange={handleSearchChange} onClear={handleClearSearch} />

            {renderContent()}

            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Delete employee?"
                message={toDelete ? `${fullName(toDelete)} will be permanently deleted. This cannot be undone.` : ""}
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </Box>
    )
}
