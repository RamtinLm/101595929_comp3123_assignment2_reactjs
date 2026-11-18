import { Link as RouterLink, useNavigate } from "react-router-dom"
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import GroupIcon from "@mui/icons-material/Group"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import LogoutIcon from "@mui/icons-material/Logout"
import { useAuth } from "../context/AuthContext.jsx"
import { useNotification } from "../context/NotificationContext.jsx"

// The links change depending on whether the user is logged in
export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth()
    const { notify } = useNotification()
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const handleLogout = () => {
        logout()
        notify("You have been logged out", "info")
        // replace: the protected page is swapped out of the history
        navigate("/login", { replace: true })
    }

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ gap: 1 }}>
                <PeopleAltIcon aria-hidden="true" />
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to={isAuthenticated ? "/employees" : "/login"}
                    sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontWeight: 700 }}
                >
                    {isMobile ? "EMS" : "Employee Management"}
                </Typography>

                {isAuthenticated && isMobile && (
                    <>
                        <Tooltip title="Employees">
                            <IconButton color="inherit" component={RouterLink} to="/employees" aria-label="Employees">
                                <GroupIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add employee">
                            <IconButton color="inherit" component={RouterLink} to="/employees/add" aria-label="Add employee">
                                <PersonAddIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Logout">
                            <IconButton color="inherit" onClick={handleLogout} aria-label="Logout">
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )}

                {isAuthenticated && !isMobile && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button color="inherit" component={RouterLink} to="/employees">Employees</Button>
                        <Button color="inherit" component={RouterLink} to="/employees/add">Add Employee</Button>
                        <Typography variant="body2" sx={{ mx: 1, opacity: 0.9 }}>
                            {user?.username}
                        </Typography>
                        <Button color="inherit" variant="outlined" onClick={handleLogout} startIcon={<LogoutIcon />}>
                            Logout
                        </Button>
                    </Box>
                )}

                {!isAuthenticated && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                        <Button color="inherit" variant="outlined" component={RouterLink} to="/signup">Sign up</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    )
}
