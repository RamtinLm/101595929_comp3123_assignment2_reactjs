import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { setUnauthorizedHandler } from "../api/axiosClient.js"
import { clearSession, readSession, saveSession } from "../utils/session.js"
import { useNotification } from "./NotificationContext.jsx"

// Holds the logged in user and token for the whole app
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const navigate = useNavigate()
    const { notify } = useNotification()

    // Lazy initial state: read localStorage once, so the session survives a refresh
    const [session, setSession] = useState(() => readSession())

    const login = useCallback((token, user) => {
        // Keep only what the UI needs
        const safeUser = { _id: user._id, username: user.username, email: user.email }
        saveSession(token, safeUser)
        setSession({ token, user: safeUser })
    }, [])

    const logout = useCallback(() => {
        clearSession()
        setSession({ token: null, user: null })
    }, [])

    // Any 401 on a protected request (missing, invalid or expired token) ends the session
    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearSession()
            setSession({ token: null, user: null })
            notify("Your session has expired. Please log in again.", "warning")
            navigate("/login", { replace: true })
        })

        return () => setUnauthorizedHandler(null)
    }, [navigate, notify])

    const value = useMemo(() => ({
        token: session.token,
        user: session.user,
        isAuthenticated: Boolean(session.token),
        login,
        logout
    }), [session, login, logout])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
