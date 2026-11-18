/*
Purpose:
Folder paths used in more than one file
Uploaded profile pictures are saved in backend/uploads
*/

const path = require("path")

const UPLOAD_DIR = path.join(__dirname, "..", "uploads")

module.exports = { UPLOAD_DIR }
