import mysql from "mysql2/promise";
import env from "../config/env.js";
import logger from "../config/logger.js";

let mysqlPool = null;
let isMysqlConnected = false;

function normalizeMysqlParams(params = []) {
  if (!Array.isArray(params)) return [];
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === "number" && Number.isNaN(p)) return null;
    return p;
  });
}

function wrapMysqlConnection(conn) {
  if (!conn || conn._wrapped) return conn;

  const execute = conn.execute.bind(conn);
  const query = conn.query.bind(conn);

  conn.execute = async (sql, params = []) => {
    const clean = normalizeMysqlParams(params);
    try {
      return await execute(sql, clean);
    } catch (err) {
      const msg = String(err?.message || "");
      if (
        err?.code === "ER_WRONG_ARGUMENTS" ||
        err?.errno === 1210 ||
        msg.includes("Incorrect arguments to mysqld_stmt_execute") ||
        msg.includes("Bind parameters must not contain undefined")
      ) {
        return await query(sql, clean);
      }
      throw err;
    }
  };

  conn.query = async (sql, params = []) => {
    return await query(sql, normalizeMysqlParams(params));
  };

  conn._wrapped = true;
  return conn;
}

export async function connectDatabase() {
  if (mysqlPool && isMysqlConnected) return mysqlPool;

  try {
    const config = env.DB.URL || {
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      database: env.DB.NAME,
      waitForConnections: true,
      connectionLimit: env.DB.CONNECTION_LIMIT || 20,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: "utf8mb4",
      decimalNumbers: true,
      ssl: env.DB.SSL ? { rejectUnauthorized: false } : undefined,
    };

    mysqlPool = mysql.createPool(config);

    const conn = await mysqlPool.getConnection();
    await conn.ping();
    conn.release();

    isMysqlConnected = true;
    logger.info("MySQL Database Connected Successfully");
    return mysqlPool;
  } catch (err) {
    logger.error(
      "Failed to connect to MySQL: " + (err?.code || err?.message || err)
    );
    process.exit(1);
  }
}

const poolProxy = {
  async execute(sql, params = []) {
    if (!isMysqlConnected) {
      throw new Error("Database is not connected. Call connectDatabase() first.");
    }

    const clean = normalizeMysqlParams(params);

    try {
      return await mysqlPool.execute(sql, clean);
    } catch (err) {
      const msg = String(err?.message || "");
      if (
        err?.code === "ER_WRONG_ARGUMENTS" ||
        err?.errno === 1210 ||
        msg.includes("Incorrect arguments to mysqld_stmt_execute") ||
        msg.includes("Bind parameters must not contain undefined")
      ) {
        return await mysqlPool.query(sql, clean);
      }
      throw err;
    }
  },

  async query(sql, params = []) {
    if (!isMysqlConnected) {
      throw new Error("Database is not connected. Call connectDatabase() first.");
    }

    return await mysqlPool.query(sql, normalizeMysqlParams(params));
  },

  async getConnection() {
    if (!isMysqlConnected) {
      throw new Error("Database is not connected. Call connectDatabase() first.");
    }

    const conn = await mysqlPool.getConnection();
    return wrapMysqlConnection(conn);
  },
};

export default poolProxy;