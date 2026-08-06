import app from "./app.js";
import env from "./config/env.js";
import { connectDatabase } from "./database/db.js";
import logger from "./config/logger.js";
import { initializeDatabase } from "./database/initialize/initialize.runner.js";

async function startServer() {
    
    try {
        
        await connectDatabase();
        await initializeDatabase()

        const port = Number(process.env.PORT) || env.PORT || 3000;
        app.listen(port, "0.0.0.0", () => {
            logger.info(`Server is Running on http://0.0.0.0:${port}`);
        });
    }
     catch (error) {

        logger.error(error.stack);

        process.exit(1);

    }
    
}

startServer();