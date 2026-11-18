/*
Turn Axios errors into short, user-friendly messages
Never show raw error objects or stack traces to the user
*/

export const isCanceled = (error) => error?.code === "ERR_CANCELED"

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    if (isCanceled(error)) return ""

    // No response at all: server down, wrong URL, CORS blocked, no internet
    if (!error?.response) {
        if (error?.code === "ECONNABORTED") return "The server took too long to respond. Please try again."
        return "Cannot reach the server. Check your connection and try again."
    }

    const { status, data } = error.response

    if (status === 429) return data?.message || "Too many requests. Please wait a few minutes and try again."
    if (status === 413) return data?.message || "The file is too large."
    if (status >= 500) return "The server had a problem. Please try again later."
    if (typeof data?.message === "string") return data.message

    return fallback
}

// Backend 400 responses look like { errors: [{ field, message }] }
// This turns them into { fieldName: message } so each input can show its own error
export const getFieldErrors = (error) => {
    const fields = {}
    const response = error?.response
    const list = response?.data?.errors

    if (Array.isArray(list)) {
        list.forEach((item) => {
            String(item.field || "")
                .split(",")
                .map((name) => name.trim())
                .filter(Boolean)
                .forEach((name) => {
                    if (!fields[name]) fields[name] = item.message
                })
        })
    }

    const message = response?.data?.message || ""

    // 409 duplicates: "Username already exists", "Email already exists", "Duplicate value for: email"
    if (response?.status === 409) {
        if (/username/i.test(message)) fields.username = message
        else if (/email/i.test(message)) fields.email = message
    }

    // Upload problems: wrong type (400) or too large (413)
    if (response?.status === 413 || /picture|file/i.test(message)) {
        fields.profile_picture = message
    }

    return fields
}
