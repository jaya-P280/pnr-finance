import app from "../app.js";
import { connectDatabase } from "../database/db.js";
import { initializeDatabase } from "../database/initialize/initialize.runner.js";
import logger from "../config/logger.js";

let isInitialized = false;

async function init() {
  if (!isInitialized) {
    try {
      await connectDatabase();
      initializeDatabase().catch((err) => {
        logger.error("Database schema init warning: " + (err?.message || err));
      });
      isInitialized = true;
    } catch (error) {
      logger.error("Database connection failed in serverless function: " + (error?.stack || error));
    }
  }
}

export default async function handler(req, res) {
  await init();
  return app(req, res);
}
