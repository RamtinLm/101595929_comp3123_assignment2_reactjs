/*
Purpose:
Central error handling, every error in the app ends up here
Turns known errors into clear JSON responses with the right status code
Unknown errors become a generic 500, the details go to the log only (no stack traces to the client)
*/

const multer = require("multer")
const AppError = require("../utils/AppError.js")
const logger = require("../utils/logger.js")
const { MAX_FILE_MB } = require("./upload.js")


// 404 for any route that does not exist
const notFound = (req, res) => {
    res.status(404).send({
        status: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    })
}


// Must have 4 parameters so Express knows it is an error handler
const errorHandler = (err, req, res, next) => {
    // Broken JSON in the request body (thrown by express.json)
    if(err.type === "entity.parse.failed"){
        logger.warn(`Malformed JSON on ${req.method} ${req.originalUrl}`)
        return res.status(400).send({
            status: false,
            message: "Malformed JSON in request body"
        })
    }

    // Body bigger than the limit set in express.json
    if(err.type === "entity.too.large"){
        return res.status(413).send({
            status: false,
            message: "Request body is too large"
        })
    }

    // File upload errors from multer
    if(err instanceof multer.MulterError){
        logger.warn(`Upload rejected on ${req.method} ${req.originalUrl}: ${err.code}`)

        if(err.code === "LIMIT_FILE_SIZE"){
            return res.status(413).send({
                status: false,
                message: `Profile picture must be ${MAX_FILE_MB} MB or smaller`
            })
        }

        const uploadMessages = {
            LIMIT_UNEXPECTED_FILE: "Only one file is allowed, in the profile_picture field",
            LIMIT_FILE_COUNT: "Only one file is allowed, in the profile_picture field",
            LIMIT_FIELD_COUNT: "Too many form fields"
        }

        return res.status(400).send({
            status: false,
            message: uploadMessages[err.code] || "Invalid file upload"
        })
    }

    // Broken multipart body (for example a missing boundary)
    if(typeof err.message === "string" && (err.message.startsWith("Multipart") || err.message === "Unexpected end of form")){
        logger.warn(`Malformed form data on ${req.method} ${req.originalUrl}`)
        return res.status(400).send({
            status: false,
            message: "Malformed form data"
        })
    }

    // Our own errors (404, 403, ...) thrown with new AppError(status, message)
    if(err instanceof AppError){
        return res.status(err.statusCode).send({
            status: false,
            message: err.message
        })
    }

    // MongoDB duplicate key (unique index), for example the same employee email twice
    if(err.code === 11000){
        const fields = Object.keys(err.keyValue || {}).filter((f) => f !== "user").join(", ")
        logger.warn(`Duplicate key on ${req.method} ${req.originalUrl}: ${fields}`)
        return res.status(409).send({
            status: false,
            message: `Duplicate value for: ${fields || "unique field"}`
        })
    }

    // Mongoose schema validation failed
    if(err.name === "ValidationError"){
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message
        }))
        logger.warn(`Database validation failed on ${req.method} ${req.originalUrl}`)
        return res.status(400).send({
            status: false,
            message: "Validation failed",
            errors: errors
        })
    }

    // Invalid id format that slipped past the validators
    if(err.name === "CastError"){
        return res.status(400).send({
            status: false,
            message: `Invalid value for ${err.path}`
        })
    }

    // Anything else: log the details, send a generic message
    logger.error(`${req.method} ${req.originalUrl} - ${err.name}: ${err.message}`)

    res.status(500).send({
        status: false,
        message: "Internal server error"
    })
}

module.exports = { notFound, errorHandler }
