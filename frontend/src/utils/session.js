/*
Session storage helpers (localStorage)
The token survives a page refresh because it lives in localStorage
Trade-off: any script running on the page (XSS) could read it, an httpOnly cookie would not allow that
*/

const TOKEN_KEY = "token"
const USER_KEY = "user"

export const getToken = () => localStorage.getItem(TOKEN_KEY)

// Read "exp" from the JWT payload (the payload is only base64, not encrypted)
// This is only a UX check, the backend still verifies the signature on every request
export const isTokenExpired = (token) => {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(atob(base64))
        return !payload.exp || payload.exp * 1000 <= Date.now()
    } catch {
        return true
    }
}

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Used once when the app starts
export const readSession = () => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token || isTokenExpired(token)) {
        clearSession()
        return { token: null, user: null }
    }

    let user = null
    try {
        user = JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
        user = null
    }

    return { token, user }
}
