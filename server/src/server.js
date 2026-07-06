import app from "./app.js";
import env from "./config/env.js";
import {connectDatabase} from "./database/db.js";

async function startServer() {
    await connectDatabase();
    app.listen(env.PORT,()=>{
        console.log(`Server is Running on Port ${env.PORT}`);
    })
    
}

startServer();