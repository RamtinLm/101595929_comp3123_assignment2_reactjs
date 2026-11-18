import { API_URL } from "../api/axiosClient.js"

// The backend stores "/uploads/<uuid>.jpg", the browser needs the full URL
export const imageUrl = (storedPath) => {
    if (typeof storedPath !== "string" || !storedPath.startsWith("/uploads/")) return null
    return `${API_URL}${storedPath}`
}
