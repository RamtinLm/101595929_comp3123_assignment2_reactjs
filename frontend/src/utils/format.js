// Display helpers for salaries and dates

const currencyFormatter = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" })

// date_of_joining is stored as midnight UTC, format it in UTC or Toronto shows the day before
const dateFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeZone: "UTC" })

// created_at / updated_at are real moments in time, show them in the user's time zone
const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" })

export const formatSalary = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? currencyFormatter.format(number) : "-"
}

export const formatDate = (value) => {
    if (!value) return "-"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date)
}

export const formatDateTime = (value) => {
    if (!value) return "-"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date)
}

// "2026-01-15T00:00:00.000Z" -> "2026-01-15" for <input type="date">
export const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : "")

export const fullName = (employee) => `${employee?.first_name ?? ""} ${employee?.last_name ?? ""}`.trim()
