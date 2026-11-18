import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material"

// Loading, error and empty states used by the pages

export function LoadingState({ label = "Loading..." }) {
    return (
        <Box role="status" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
            <CircularProgress aria-label={label} />
            <Typography sx={{ color: "text.secondary" }}>{label}</Typography>
        </Box>
    )
}

export function ErrorState({ message, onRetry }) {
    return (
        <Alert
            severity="error"
            action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Retry</Button> : null}
        >
            {message}
        </Alert>
    )
}

export function EmptyState({ icon, title, message, action }) {
    return (
        <Paper variant="outlined" sx={{ py: 8, px: 3, textAlign: "center" }}>
            {icon && <Box sx={{ color: "text.disabled", mb: 1, "& svg": { fontSize: 56 } }}>{icon}</Box>}
            <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>{title}</Typography>
            {message && <Typography sx={{ color: "text.secondary", mt: 1 }}>{message}</Typography>}
            {action && <Box sx={{ mt: 3 }}>{action}</Box>}
        </Paper>
    )
}
