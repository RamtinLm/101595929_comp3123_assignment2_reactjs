import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

// Logged in users do not need /login or /signup, send them to the list
export default function PublicOnlyRoute() {
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to="/employees" replace />
    }

    return <Outlet />
}
