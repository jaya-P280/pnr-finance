import app from "./app.js";
import env from "./config/env.js";
import {connectDatabase} from "./database/db.js";
import logger from "./config/logger.js";

async function startServer() {
    await connectDatabase();
    app.listen(env.PORT,()=>{
        logger.info(`Server is Running on http://localhost:${env.PORT}`);
    })
    
}

startServer();