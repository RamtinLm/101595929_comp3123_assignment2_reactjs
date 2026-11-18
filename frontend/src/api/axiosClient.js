/*
One shared Axios instance for every API call
- baseURL comes from VITE_API_URL
- Request interceptor adds "Authorization: Bearer <token>"
- Response interceptor: a 401 on a protected request means the session is over
No default Content-Type on purpose: Axios sends JSON for objects and
multipart/form-data (with the boundary) for FormData by itself
*/

import axios from "axios"
import { getToken } from "../utils/session.js"

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/+$/, "")

const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 15000
})

// AuthContext registers what to do on 401 (clear session, go to /login)
let onUnauthorized = null

export const setUnauthorizedHandler = (handler) => {
    onUnauthorized = handler
}

api.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// Wrong password on login is also a 401, that one must NOT log the user out
const AUTH_PATHS = ["/user/login", "/user/signup"]

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const url = error.config?.url || ""
        const isAuthRequest = AUTH_PATHS.some((path) => url.includes(path))

        if (status === 401 && !isAuthRequest && onUnauthorized) {
            onUnauthorized()
        }

        return Promise.reject(error)
    }
)

export default api
