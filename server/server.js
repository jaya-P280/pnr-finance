import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase } from "./database/db.js";
import logger from "./config/logger.js";
import { initializeDatabase } from "./database/initialize/initialize.runner.js";

async function startServer() {
    
    try {
        
        await connectDatabase();
        await initializeDatabase()

        app.listen(env.PORT, () => {
            logger.info(`Server is Running on http://localhost:${env.PORT}`);
        });
    }
     catch (error) {

        logger.error(error.stack);

        process.exit(1);

    }
    
}

startServer();