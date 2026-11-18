import { Avatar, Box, Paper, Typography } from "@mui/material"

// Shared centered card for the login and signup screens
export default function AuthCard({ icon, title, subtitle, children }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 2, sm: 6 } }}>
            <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, width: "100%", maxWidth: 440 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>{icon}</Avatar>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>{title}</Typography>
                    {subtitle && <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{subtitle}</Typography>}
                </Box>
                {children}
            </Paper>
        </Box>
    )
}
