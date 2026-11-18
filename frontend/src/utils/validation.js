/*
Client-side validation, same rules as the backend validators
This only improves usability, the backend is still the source of truth
Each function returns an object like { fieldName: "error message" }, empty = valid
*/

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const MAX_IMAGE_MB = 2
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim())

export const getPasswordError = (password) => {
    if (!password) return "Password is required"
    if (password.length < 8 || password.length > 64) return "Password must be 8 to 64 characters"
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter"
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain a number"
    return ""
}

export const validateSignup = ({ username, email, password, confirmPassword }) => {
    const errors = {}
    const name = username.trim()

    if (!name) errors.username = "Username is required"
    else if (name.length < 3 || name.length > 30) errors.username = "Username must be 3 to 30 characters"
    else if (!USERNAME_REGEX.test(name)) errors.username = "Username can only contain letters, numbers and _"

    if (!email.trim()) errors.email = "Email is required"
    else if (email.trim().length > 100) errors.email = "Email must be at most 100 characters"
    else if (!isValidEmail(email)) errors.email = "Email format is invalid"

    const passwordError = getPasswordError(password)
    if (passwordError) errors.password = passwordError

    if (!confirmPassword) errors.confirmPassword = "Please confirm your password"
    else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match"

    return errors
}

export const validateLogin = ({ identifier, password }) => {
    const errors = {}
    const value = identifier.trim()

    if (!value) errors.identifier = "Username or email is required"
    else if (value.includes("@") && !isValidEmail(value)) errors.identifier = "Email format is invalid"

    if (!password) errors.password = "Password is required"

    return errors
}

const isRealDate = (value) => {
    if (!DATE_REGEX.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const checkText = (errors, values, field, label, max) => {
    const value = (values[field] || "").trim()
    if (!value) errors[field] = `${label} is required`
    else if (value.length > max) errors[field] = `${label} must be at most ${max} characters`
}

export const validateEmployee = (values) => {
    const errors = {}

    checkText(errors, values, "first_name", "First name", 50)
    checkText(errors, values, "last_name", "Last name", 50)
    checkText(errors, values, "position", "Position", 100)
    checkText(errors, values, "department", "Department", 100)

    const email = (values.email || "").trim()
    if (!email) errors.email = "Email is required"
    else if (email.length > 100) errors.email = "Email must be at most 100 characters"
    else if (!isValidEmail(email)) errors.email = "Email format is invalid"

    const salary = Number(values.salary)
    if (values.salary === "" || values.salary === null || values.salary === undefined) errors.salary = "Salary is required"
    else if (!Number.isFinite(salary) || salary <= 0) errors.salary = "Salary must be a positive number"
    else if (salary > 100000000) errors.salary = "Salary is too large"

    if (!values.date_of_joining) errors.date_of_joining = "Date of joining is required"
    else if (!isRealDate(values.date_of_joining)) errors.date_of_joining = "Date of joining must be a valid date"

    return errors
}

// Returns an error message or "" when the file is fine
export const validateImageFile = (file) => {
    if (!file) return ""
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPEG, PNG or WebP images are allowed"
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Image must be ${MAX_IMAGE_MB} MB or smaller`
    return ""
}
