import { useEffect, useRef, useState } from "react"
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from "@mui/material"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import EmployeeAvatar from "./EmployeeAvatar.jsx"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_MB, validateEmployee, validateImageFile } from "../utils/validation.js"

const EMPTY_VALUES = {
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
    date_of_joining: ""
}

// Shared by Add and Edit
// Controlled inputs, client validation, picture preview
// The page passes onSubmit(values, file) and shows backend errors through serverErrors / formError
export default function EmployeeForm({
    initialValues = EMPTY_VALUES,
    currentPictureUrl = null,
    submitLabel = "Save",
    submitting = false,
    serverErrors = {},
    formError = "",
    onSubmit,
    onCancel
}) {
    const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues })
    const [errors, setErrors] = useState({})
    const [file, setFile] = useState(null)
    const [fileError, setFileError] = useState("")
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)

    // Preview URL for the chosen file, freed again when the file changes or the form closes
    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }
        const url = URL.createObjectURL(file)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [file])

    const fieldError = (name) => errors[name] || serverErrors[name] || ""

    const handleChange = (event) => {
        const { name, value } = event.target
        setValues((current) => ({ ...current, [name]: value }))
        setErrors((current) => ({ ...current, [name]: "" }))
    }

    const handleFileChange = (event) => {
        const selected = event.target.files?.[0]
        event.target.value = "" // lets the user pick the same file again
        if (!selected) return

        const error = validateImageFile(selected)
        if (error) {
            setFileError(error)
            return
        }

        setFileError("")
        setFile(selected)
    }

    const handleRemoveFile = () => {
        setFile(null)
        setFileError("")
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const validationErrors = validateEmployee(values)
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0 || fileError) {
            return
        }

        onSubmit(values, file)
    }

    const pictureError = fileError || serverErrors.profile_picture || ""

    const textInput = (name, label, maxLength, extra = {}) => (
        <TextField
            id={name}
            name={name}
            label={label}
            value={values[name]}
            onChange={handleChange}
            error={Boolean(fieldError(name))}
            helperText={fieldError(name) || " "}
            required
            fullWidth
            disabled={submitting}
            slotProps={{ htmlInput: { maxLength } }}
            {...extra}
        />
    )

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {formError && <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", mb: 3 }}>
                <EmployeeAvatar employee={values} src={preview || currentPictureUrl} size={96} />
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                    <input
                        ref={fileInputRef}
                        id="profile_picture"
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                        onChange={handleFileChange}
                        hidden
                    />
                    <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}>
                        <Button
                            variant="outlined"
                            startIcon={<PhotoCameraIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={submitting}
                            aria-describedby="profile-picture-help"
                        >
                            {currentPictureUrl || file ? "Change picture" : "Upload picture"}
                        </Button>
                        {file && (
                            <Button color="inherit" onClick={handleRemoveFile} disabled={submitting}>
                                Undo
                            </Button>
                        )}
                    </Stack>
                    <Typography
                        id="profile-picture-help"
                        variant="body2"
                        role={pictureError ? "alert" : undefined}
                        sx={{ mt: 1, color: pictureError ? "error.main" : "text.secondary" }}
                    >
                        {pictureError || (file ? `Selected: ${file.name}` : `JPEG, PNG or WebP, up to ${MAX_IMAGE_MB} MB`)}
                    </Typography>
                </Box>
            </Stack>

            <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                {textInput("first_name", "First name", 50, { autoFocus: true })}
                {textInput("last_name", "Last name", 50)}
                {textInput("email", "Email", 100, { type: "email", autoComplete: "off" })}
                {textInput("position", "Position", 100)}
                {textInput("department", "Department", 100)}
                {textInput("salary", "Salary", 12, {
                    type: "number",
                    slotProps: {
                        input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                        htmlInput: { min: 0.01, step: "0.01" }
                    }
                })}
                {textInput("date_of_joining", "Date of joining", 10, {
                    type: "date",
                    slotProps: { inputLabel: { shrink: true } }
                })}
            </Box>

            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={onCancel} disabled={submitting} color="inherit">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {submitting ? "Saving..." : submitLabel}
                </Button>
            </Stack>
        </Box>
    )
}
