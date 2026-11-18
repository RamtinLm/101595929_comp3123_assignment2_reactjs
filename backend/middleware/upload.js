/*
Purpose:
Multer setup for the profile picture upload (multipart/form-data)
The file is kept in memory first, the controller saves it to disk only after
validation and the ownership check pass, so rejected requests never leave files behind
*/

const multer = require("multer")
const AppError = require("../utils/AppError.js")

const MAX_FILE_MB = 2
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_MB * 1024 * 1024, // bigger files -> LIMIT_FILE_SIZE error
        files: 1,
        fields: 20
    },
    // Quick first check on the type the client says it is
    // The real check (magic bytes) happens in services/fileService.js
    fileFilter: (req, file, cb) => {
        if(!ALLOWED_TYPES.includes(file.mimetype)){
            return cb(new AppError(400, "Profile picture must be a JPEG, PNG or WebP image"))
        }
        cb(null, true)
    }
})

// Field name must be "profile_picture", any other file field -> LIMIT_UNEXPECTED_FILE
const uploadPicture = upload.single("profile_picture")

module.exports = { uploadPicture, MAX_FILE_MB }
