import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { CssBaseline, ThemeProvider } from "@mui/material"
import theme from "./theme.js"
import { NotificationProvider } from "./context/NotificationContext.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import App from "./App.jsx"

// Order matters:
// BrowserRouter first (AuthProvider uses useNavigate)
// NotificationProvider before AuthProvider (AuthProvider shows a toast when the session expires)
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NotificationProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
)
