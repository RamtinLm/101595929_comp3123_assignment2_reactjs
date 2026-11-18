import { Link as RouterLink } from "react-router-dom"
import { Button } from "@mui/material"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import { EmptyState } from "../components/PageState.jsx"

// Catch-all for unknown URLs
export default function NotFoundPage() {
    return (
        <EmptyState
            icon={<SearchOffIcon />}
            title="404 - Page not found"
            message="The page you are looking for does not exist."
            action={<Button variant="contained" component={RouterLink} to="/">Go to home</Button>}
        />
    )
}
