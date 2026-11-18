/*
Purpose:
Save and delete profile pictures on disk
- The real file type is checked from the first bytes of the file (magic bytes),
  never from the file name or the type the client sends
- File names are random (UUID), the original name is never used
- Only the file name part of a stored path is used, so no path traversal
*/

const fs = require("fs/promises")
const path = require("path")
const crypto = require("crypto")
const { UPLOAD_DIR } = require("../config/paths.js")
const AppError = require("../utils/AppError.js")
const logger = require("../utils/logger.js")


// Returns "jpg", "png", "webp" or null
const detectImageType = (buffer) => {
    if(!buffer || buffer.length < 12){
        return null
    }

    // JPEG starts with FF D8 FF
    if(buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff){
        return "jpg"
    }

    // PNG starts with 89 50 4E 47 0D 0A 1A 0A
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    if(buffer.subarray(0, 8).equals(pngSignature)){
        return "png"
    }

    // WebP is "RIFF" + 4 bytes size + "WEBP"
    if(buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP"){
        return "webp"
    }

    return null
}


// Save an uploaded file (from multer memory storage), returns the path stored in the DB
const savePicture = async (file) => {
    const ext = detectImageType(file.buffer)

    if(!ext){
        throw new AppError(400, "Profile picture must be a JPEG, PNG or WebP image")
    }

    const fileName = `${crypto.randomUUID()}.${ext}`

    // flag "wx" = fail if the file already exists, never overwrite
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), file.buffer, { flag: "wx" })

    logger.info(`Profile picture saved: ${fileName}`)

    return `/uploads/${fileName}`
}


// Delete a stored picture, never throws (a missing file is not an error here)
const deletePicture = async (storedPath) => {
    if(!storedPath){
        return
    }

    // basename removes any folder part, so "../../server.js" becomes "server.js" inside uploads
    const fileName = path.basename(storedPath)

    try{
        await fs.unlink(path.join(UPLOAD_DIR, fileName))
        logger.info(`Profile picture deleted: ${fileName}`)
    } catch(err){
        if(err.code !== "ENOENT"){
            logger.warn(`Could not delete profile picture ${fileName}: ${err.message}`)
        }
    }
}

module.exports = { detectImageType, savePicture, deletePicture }
