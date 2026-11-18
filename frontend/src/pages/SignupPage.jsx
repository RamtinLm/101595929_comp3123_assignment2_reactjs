import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from "@mui/material"
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt"
import AuthCard from "../components/AuthCard.jsx"
import PasswordField from "../components/PasswordField.jsx"
import { signupUser } from "../api/authApi.js"
import { useNotification } from "../context/NotificationContext.jsx"
import { validateSignup } from "../utils/validation.js"
import { getErrorMessage, getFieldErrors } from "../utils/errors.js"

const PASSWORD_HINT = "8 to 64 characters, with an uppercase letter, a lowercase letter and a number"

export default function SignupPage() {
    const { notify } = useNotification()
    const navigate = useNavigate()

    const [values, setValues] = useState({ username: "", email: "", password: "", confirmPassword: "" })
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

        const validationErrors = validateSignup(values)
        setErrors(validationErrors)
        if (Object.keys(validationErrors).length > 0) return

        setSubmitting(true)
        try {
            // confirmPassword is only checked here, the backend rejects unknown fields
            await signupUser({
                username: values.username.trim(),
                email: values.email.trim(),
                password: values.password
            })
            notify("Account created. Please log in.")
            navigate("/login", { replace: true })
        } catch (error) {
            setErrors(getFieldErrors(error))
            setFormError(getErrorMessage(error, "Signup failed. Please try again."))
            setSubmitting(false)
        }
    }

    const field = (name) => ({
        id: name,
        name,
        value: values[name],
        onChange: handleChange,
        error: Boolean(errors[name]),
        required: true,
        fullWidth: true,
        disabled: submitting
    })

    return (
        <AuthCard icon={<PersonAddAltIcon />} title="Create account" subtitle="Sign up to start managing employees">
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                <TextField
                    {...field("username")}
                    label="Username"
                    helperText={errors.username || "3 to 30 letters, numbers or _"}
                    autoComplete="username"
                    autoFocus
                    slotProps={{ htmlInput: { maxLength: 30 } }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    {...field("email")}
                    label="Email"
                    type="email"
                    helperText={errors.email || " "}
                    autoComplete="email"
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <PasswordField
                    {...field("password")}
                    label="Password"
                    helperText={errors.password || PASSWORD_HINT}
                    autoComplete="new-password"
                    sx={{ mb: 2 }}
                />
                <PasswordField
                    {...field("confirmPassword")}
                    label="Confirm password"
                    helperText={errors.confirmPassword || " "}
                    autoComplete="new-password"
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
                    {submitting ? "Creating account..." : "Sign up"}
                </Button>

                <Typography sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
                    Already have an account?{" "}
                    <Link component={RouterLink} to="/login">Login</Link>
                </Typography>
            </Box>
        </AuthCard>
    )
}
