require("dotenv").config({ quiet: true })

// Fix for MongoDB Atlas SRV lookup on some networks
// Only needed for "mongodb+srv://" URIs, Docker uses its own DNS for the "mongo" service name
if((process.env.MONGODB_URI || "").startsWith("mongodb+srv") && !process.env.VERCEL){
    require("dns").setServers(["8.8.8.8", "1.1.1.1"])
}

const fs = require("fs")
const express = require("express")
const mongoose = require("mongoose")
const helmet = require("helmet")
const connectDB = require("./config/db.js")
const corsMiddleware = require("./config/cors.js")
const { UPLOAD_DIR } = require("./config/paths.js")
const logger = require("./utils/logger.js")
const requestLogger = require("./middleware/requestLogger.js")
const { apiLimiter } = require("./middleware/rateLimiter.js")
const { notFound, errorHandler } = require("./middleware/errorHandler.js")
const userRoutes = require("./routes/userRoutes.js")
const employeeRoutes = require("./routes/employeeRoutes.js")


// Stop right away if a required setting is missing
// Only the names are logged, never the values
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET", "CORS_ORIGIN"]
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name])

if(missingEnv.length > 0){
    logger.error("Missing environment variables: " + missingEnv.join(", "))
    throw new Error("Missing environment variables: " + missingEnv.join(", "))
}


// Make sure the uploads folder exists before any picture is saved
fs.mkdirSync(UPLOAD_DIR, { recursive: true })


const PORT = process.env.PORT || 8081

const app = express()

// On Vercel the app sits behind a proxy, trust it so req.ip is the real client IP
if(process.env.VERCEL){
    app.set("trust proxy", 1)
}


// Middleware
// Request logger goes first so even bad requests (broken JSON) get logged
app.use(requestLogger)

// CORS before the rate limiter and routes, so 401 / 429 responses also carry
// the CORS headers and the browser can read them (and preflight OPTIONS is answered here)
app.use(corsMiddleware)

// Security headers, also removes X-Powered-By
// cross-origin resource policy lets the frontend (another origin) show our /uploads images
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(express.json({ limit: "10kb" })) // Parse JSON bodies, reject huge ones
app.use(express.urlencoded({ extended: true, limit: "10kb" })) // Parse form bodies


// Root route
// GET http://localhost:8081/
app.get("/", (req, res) => {
    res.send("<h2>COMP3123 Assignment 2 - Employee Management API</h2>")
})


// Health check
// GET http://localhost:8081/health
app.get("/health", async (req, res) => {
    const dbStates = ["disconnected", "connected", "connecting", "disconnecting"]

    // Try to connect so the health check shows the real DB state
    try{
        await connectDB()
    } catch(err){
        logger.error("Health check could not reach the DB: " + err.message)
    }

    res.status(200).send({
        status: "ok",
        message: "API is running",
        uptime: Math.round(process.uptime()) + "s",
        timestamp: new Date().toISOString(),
        database: dbStates[mongoose.connection.readyState]
    })
})


// Uploaded profile pictures, for example GET http://localhost:8081/uploads/<uuid>.jpg
// File names are random UUIDs, dotfiles and folder listings are blocked
app.use("/uploads", express.static(UPLOAD_DIR, {
    dotfiles: "deny",
    index: false,
    fallthrough: true
}))


// General rate limit for all API routes
app.use("/api", apiLimiter)


// Every route below this line needs the DB
// Express 5 sends errors from async middleware to the error handler by itself
app.use(async (req, res, next) => {
    await connectDB()
    next()
})


// API routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/emp", employeeRoutes)


// Unknown routes, then the central error handler (must be last)
app.use(notFound)
app.use(errorHandler)


// Vercel runs the app itself, so only listen when running locally or in Docker
if(!process.env.VERCEL){
    app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`)
    })
} else {
    logger.info("App loaded on Vercel")
}

module.exports = app
