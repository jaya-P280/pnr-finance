import mysql from "mysql2/promise";
import env from "../config/env.js";
import logger from "../config/logger.js";

const pool = mysql.createPool({
    host:env.DB.HOST,
    port:env.DB.PORT,
    user:env.DB.USER,
    password:env.DB.PASSWORD,
    database:env.DB.NAME,

    waitForConnections: true,

    connectionLimit :20,

    queueLimit:0,
});

export async function connectDatabase() {
    try{
        const connection = await pool.getConnection();

        logger.info("MYSQL is Connected");
        connection.release();
    }catch(error){
        logger.error(error.stack || error);
        process.exit(1);
    }

}

export default pool;