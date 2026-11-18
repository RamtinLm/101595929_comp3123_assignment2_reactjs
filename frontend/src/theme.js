import { createTheme } from "@mui/material"

// One place for colors, shapes and fonts so every screen looks the same
const theme = createTheme({
    palette: {
        primary: { main: "#2563eb" },
        secondary: { main: "#0f766e" },
        background: { default: "#f4f6fb", paper: "#ffffff" }
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif',
        button: { textTransform: "none", fontWeight: 600 }
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true }
        },
        MuiTableCell: {
            styleOverrides: {
                head: { fontWeight: 700, backgroundColor: "#f8fafc" }
            }
        }
    }
})

export default theme
