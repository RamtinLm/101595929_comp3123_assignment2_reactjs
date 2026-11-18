/*
Purpose:
Connect to MongoDB once and reuse the same connection
*/

const mongoose = require("mongoose")
const logger = require("../utils/logger.js")

const DB_NAME = process.env.DB_NAME || "comp3123_assignment2"

const connectDB = async () => {
    // 1 = connected, so skip connecting again
    if(mongoose.connection.readyState === 1){
        return
    }

    // dbName forces the database name no matter what the URI says
    // serverSelectionTimeoutMS: give up after 5 seconds instead of the default 30
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 5000
    })

    logger.info(`Connected to MongoDB database ${DB_NAME}`)
}

module.exports = connectDB
