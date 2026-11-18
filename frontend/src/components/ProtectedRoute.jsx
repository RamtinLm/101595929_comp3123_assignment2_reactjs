import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

// Logged out users are sent to /login
// replace: the protected URL is not kept in history, so Back does not reopen it after logout
export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}
