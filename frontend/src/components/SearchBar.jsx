import { Button, InputAdornment, Paper, Stack, TextField } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ClearIcon from "@mui/icons-material/Clear"

// Department and position search inputs (the list page calls the backend search API)
export default function SearchBar({ values, onChange, onClear }) {
    const hasSearch = Boolean(values.department || values.position)

    const searchIcon = {
        startAdornment: (
            <InputAdornment position="start">
                <SearchIcon fontSize="small" />
            </InputAdornment>
        )
    }

    return (
        <Paper
            component="form"
            role="search"
            aria-label="Search employees"
            variant="outlined"
            onSubmit={(event) => event.preventDefault()}
            sx={{ p: 2, mb: 2 }}
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                    label="Search by department"
                    name="department"
                    value={values.department}
                    onChange={onChange}
                    placeholder="e.g. Engineering"
                    size="small"
                    fullWidth
                    slotProps={{ input: searchIcon, htmlInput: { maxLength: 100 } }}
                />
                <TextField
                    label="Search by position"
                    name="position"
                    value={values.position}
                    onChange={onChange}
                    placeholder="e.g. Developer"
                    size="small"
                    fullWidth
                    slotProps={{ input: searchIcon, htmlInput: { maxLength: 100 } }}
                />
                <Button
                    onClick={onClear}
                    disabled={!hasSearch}
                    startIcon={<ClearIcon />}
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                >
                    Clear
                </Button>
            </Stack>
        </Paper>
    )
}
