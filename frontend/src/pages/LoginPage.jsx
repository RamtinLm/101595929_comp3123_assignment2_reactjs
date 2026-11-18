import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from "@mui/material"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import AuthCard from "../components/AuthCard.jsx"
import PasswordField from "../components/PasswordField.jsx"
import { loginUser } from "../api/authApi.js"
import { useAuth } from "../context/AuthContext.jsx"
import { useNotification } from "../context/NotificationContext.jsx"
import { validateLogin } from "../utils/validation.js"
import { getErrorMessage, getFieldErrors } from "../utils/errors.js"

export default function LoginPage() {
    const { login } = useAuth()
    const { notify } = useNotification()
    const navigate = useNavigate()

    const [values, setValues] = useState({ identifier: "", password: "" })
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setValues((current) => ({ ...current, [name]: value }))
        setErrors((current) => ({ ...current, [name]: "" }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setFormError("")

        const validationErrors = validateLogin(values)
        setErrors(validationErrors)
        if (Object.keys(validationErrors).length > 0) return

        // The backend accepts username OR email (and rejects any other field)
        const identifier = values.identifier.trim()
        const payload = identifier.includes("@")
            ? { email: identifier, password: values.password }
            : { username: identifier, password: values.password }

        setSubmitting(true)
        try {
            const response = await loginUser(payload)
            login(response.data.token, response.data.user)
            notify(`Welcome, ${response.data.user.username}!`)
            navigate("/employees", { replace: true })
        } catch (error) {
            const fields = getFieldErrors(error)
            setErrors({
                identifier: fields.username || fields.email || "",
                password: fields.password || ""
            })
            setFormError(getErrorMessage(error, "Login failed. Please try again."))
            setSubmitting(false)
        }
    }

    return (
        <AuthCard icon={<LockOutlinedIcon />} title="Login" subtitle="Sign in to manage your employees">
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                <TextField
                    id="identifier"
                    name="identifier"
                    label="Username or email"
                    value={values.identifier}
                    onChange={handleChange}
                    error={Boolean(errors.identifier)}
                    helperText={errors.identifier || " "}
                    autoComplete="username"
                    autoFocus
                    required
                    fullWidth
                    disabled={submitting}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <PasswordField
                    id="password"
                    name="password"
                    label="Password"
                    value={values.password}
                    onChange={handleChange}
                    error={Boolean(errors.password)}
                    helperText={errors.password || " "}
                    autoComplete="current-password"
                    required
                    fullWidth
                    disabled={submitting}
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                    sx={{ mt: 1 }}
                >
                    {submitting ? "Logging in..." : "Login"}
                </Button>

                <Typography sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
                    No account yet?{" "}
                    <Link component={RouterLink} to="/signup">Sign up</Link>
                </Typography>
            </Box>
        </AuthCard>
    )
}
