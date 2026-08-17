import app from "../app.js";
import { connectDatabase } from "../database/db.js";
import logger from "../config/logger.js";

let dbPromise = null;

function initializeDatabaseConnection() {
    if (!dbPromise) {
        dbPromise = connectDatabase().catch((error) => {
            dbPromise = null;

            logger.error(
                `Database connection failed: ${error?.stack || error}`
            );

            throw error;
        });
    }

    return dbPromise;
}

export default async function handler(req, res) {
    try {
        await initializeDatabaseConnection();

        return app(req, res);
    } catch (error) {
        logger.error(
            `Serverless request failed: ${error?.stack || error}`
        );

        return res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
}
