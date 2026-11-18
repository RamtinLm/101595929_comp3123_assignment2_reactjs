import { Outlet } from "react-router-dom"
import { Box, Container } from "@mui/material"
import Navbar from "./Navbar.jsx"

// Shared page frame: navbar on top, page content in the middle, footer at the bottom
export default function Layout() {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, flexGrow: 1 }}>
                <Outlet />
            </Container>
            <Box component="footer" sx={{ py: 2, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
                COMP3123 Assignment 2 - Employee Management App
            </Box>
        </Box>
    )
}
