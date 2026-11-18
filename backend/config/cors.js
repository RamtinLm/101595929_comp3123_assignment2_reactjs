/*
Purpose:
CORS settings: only our frontend origin may call the API from a browser
CORS_ORIGIN comes from the environment, for example http://localhost:3000
More than one origin can be given, separated by commas
*/

const cors = require("cors")

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)

const corsOptions = {
    // Allowed origin -> header is sent back
    // Any other origin -> no header, so the browser blocks the response
    // No origin (Postman, curl) -> not a browser request, CORS does not apply
    origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.includes(origin))
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
}

module.exports = cors(corsOptions)
