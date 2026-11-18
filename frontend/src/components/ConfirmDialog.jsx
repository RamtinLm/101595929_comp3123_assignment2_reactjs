import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

// Asks before a destructive action (delete), nothing is sent until the user confirms
export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", loading = false, onConfirm, onCancel }) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onCancel}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {loading ? "Deleting..." : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
