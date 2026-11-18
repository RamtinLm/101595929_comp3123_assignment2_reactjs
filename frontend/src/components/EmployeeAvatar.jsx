import { Avatar } from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import { imageUrl } from "../utils/imageUrl.js"
import { fullName } from "../utils/format.js"

// Shows the stored picture, or a placeholder person icon when there is none
// (MUI Avatar also falls back to the icon if the image fails to load)
export default function EmployeeAvatar({ employee, size = 40, src }) {
    const url = src || imageUrl(employee?.profile_picture)
    const name = fullName(employee)

    return (
        <Avatar
            src={url || undefined}
            alt={name ? `Profile picture of ${name}` : "Profile picture"}
            sx={{ width: size, height: size, bgcolor: "grey.300", color: "grey.600" }}
        >
            <PersonIcon sx={{ fontSize: size * 0.6 }} />
        </Avatar>
    )
}
