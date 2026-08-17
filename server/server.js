import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase } from "./database/db.js";
import logger from "./config/logger.js";
import { initializeDatabase } from "./database/initialize/initialize.runner.js";

let isInitialized = false;

async function init() {
  if (!isInitialized) {
    await connectDatabase();
    await initializeDatabase();
    isInitialized = true;
  }
}

// Serverless handler for Vercel deployment
export default async function handler(req, res) {
  try {
    await init();
  } catch (error) {
    logger.error("Database initialization failed in serverless handler: " + (error?.stack || error));
  }
  return app(req, res);
}

// Standalone server for local development or container deployment
if (!process.env.VERCEL) {
  async function startServer() {
    try {
      await init();
      const port = Number(process.env.PORT) || env.PORT || 3000;
      app.listen(port, "0.0.0.0", () => {
        logger.info(`Server is Running on http://0.0.0.0:${port}`);
      });
    } catch (error) {
      logger.error(error.stack);
      process.exit(1);
    }
  }

  startServer();
}