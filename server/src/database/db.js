import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import initSqlJs from "sql.js";
import env from "../config/env.js";
import logger from "../config/logger.js";

const DB_FILE_PATH = path.join(process.cwd(), "server", "database", "sqlite.db");

let mysqlPool = null;
let isMysqlConnected = false;
let sqliteDb = null;

function persistSqliteDb() {
  if (!sqliteDb) return;
  try {
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    logger.error("Failed to persist SQLite database: " + (err?.message || err));
  }
}

if (env.DB.URL || env.DB.HOST) {
  try {
    const poolConfig = env.DB.URL || {
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      database: env.DB.NAME,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
    };
    mysqlPool = mysql.createPool(poolConfig);
  } catch (err) {
    logger.warn("MySQL pool creation failed, using SQLite fallback: " + (err?.message || err));
  }
}

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;

  const SQL = await initSqlJs();
  let db;
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      db = new SQL.Database(fileBuffer);
      logger.info("Loaded SQLite database from file: " + DB_FILE_PATH);
    } catch (err) {
      logger.warn("Failed to load existing SQLite database file, initializing new DB: " + (err?.message || err));
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Register MySQL helper functions in SQLite
  db.create_function("CONCAT", (...args) =>
    args.map((a) => (a === null || a === undefined ? "" : String(a))).join(""),
  );
  db.create_function("NOW", () =>
    new Date().toISOString().replace("T", " ").slice(0, 19),
  );
  db.create_function("CURDATE", () =>
    new Date().toISOString().split("T")[0],
  );
  db.create_function("IF", (cond, valTrue, valFalse) =>
    cond ? valTrue : valFalse,
  );
  db.create_function("DATE_FORMAT", (date, fmt) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const Y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const H = String(d.getHours()).padStart(2, "0");
    const i = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");

    let res = String(fmt || "%Y-%m-%d");
    res = res.replace(/%Y/g, Y);
    res = res.replace(/%m/g, m);
    res = res.replace(/%d/g, day);
    res = res.replace(/%H/g, H);
    res = res.replace(/%i/g, i);
    res = res.replace(/%s/g, s);
    return res;
  });
  db.create_function("DATEDIFF", (d1, d2) => {
    if (!d1 || !d2) return 0;
    const diff = new Date(d1).getTime() - new Date(d2).getTime();
    return Math.round(diff / (1000 * 3600 * 24));
  });
  db.create_function("MONTH", (d) => (d ? new Date(d).getMonth() + 1 : null));
  db.create_function("YEAR", (d) => (d ? new Date(d).getFullYear() : null));

  sqliteDb = db;
  return sqliteDb;
}

function adaptSqlForSqlite(sql) {
  let adapted = String(sql || "")
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
    .replace(/INT AUTO_INCREMENT/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
    .replace(/AUTO_INCREMENT/gi, "AUTOINCREMENT")
    .replace(/TINYINT\(\d+\)/gi, "INTEGER")
    .replace(/ENUM\([^)]+\)/gi, "VARCHAR(255)")
    .replace(/ON UPDATE CURRENT_TIMESTAMP/gi, "")
    .replace(/ENGINE\s*=\s*InnoDB/gi, "")
    .replace(/UNIX_TIMESTAMP\(\)/gi, "strftime('%s', 'now')")
    .replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+(\d+)\s+(\w+)\s*\)/gi, "date('now', '-$1 $2')")
    .replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+\?\s+(\w+)\s*\)/gi, "date('now', '-' || ? || ' $1')")
    .replace(/DATE_SUB\s*\(\s*([^,]+)\s*,\s*INTERVAL\s+(\d+)\s+(\w+)\s*\)/gi, "date($1, '-$2 $3')")
    .replace(/DATE_SUB\s*\(\s*([^,]+)\s*,\s*INTERVAL\s+\?\s+(\w+)\s*\)/gi, "date($1, '-' || ? || ' $2')");

  if (adapted.trim().toUpperCase().startsWith("CREATE TABLE")) {
    const match = adapted.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)\s*\(([\s\S]+)\)/i);
    if (match) {
      const tableName = match[1];
      const body = match[2];
      const lines = body.split("\n");
      const cleanLines = [];
      for (let line of lines) {
        const trimmed = line.trim().toUpperCase();
        if (
          trimmed.startsWith("FOREIGN KEY") ||
          trimmed.startsWith("KEY ") ||
          trimmed.startsWith("INDEX ")
        ) {
          continue;
        }
        let cleanLine = line.replace(/UNIQUE\s+KEY\s+[\w_]+\s*\(([^)]+)\)/gi, "UNIQUE ($1)");
        cleanLines.push(cleanLine);
      }
      let newBody = cleanLines.join("\n");
      // Strip trailing commas before closing paren
      newBody = newBody.replace(/,\s*(\n\s*)?$/g, "");
      // Clean up multiple trailing commas in lines
      const lineArray = newBody.split("\n").map(l => l.trim()).filter(Boolean);
      for (let i = 0; i < lineArray.length; i++) {
        if (i === lineArray.length - 1 && lineArray[i].endsWith(",")) {
          lineArray[i] = lineArray[i].slice(0, -1);
        }
      }
      adapted = `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${lineArray.join("\n  ")}\n)`;
    }
  }

  // Handle ON DUPLICATE KEY UPDATE -> Ignore duplicate errors in SQLite fallback
  if (/ON DUPLICATE KEY UPDATE/i.test(adapted)) {
    adapted = adapted.split(/ON DUPLICATE KEY UPDATE/i)[0].replace(/^INSERT/i, "INSERT OR REPLACE");
  }

  return adapted;
}

async function executeSqliteQuery(sql, params = []) {
  const db = await getSqliteDb();
  const adaptedSql = adaptSqlForSqlite(sql);

  const trimmedSql = adaptedSql.trim().toUpperCase();

  const normalizedParams = (params || []).map((p) => {
    if (p instanceof Date) {
      return p.toISOString().replace("T", " ").slice(0, 19);
    }
    return p;
  });

  if (trimmedSql.includes("INFORMATION_SCHEMA")) {
    return [[], []];
  }

  if (
    trimmedSql.startsWith("SELECT") ||
    trimmedSql.startsWith("SHOW") ||
    trimmedSql.startsWith("PRAGMA") ||
    trimmedSql.startsWith("EXPLAIN")
  ) {
    try {
      const stmt = db.prepare(adaptedSql);
      if (normalizedParams && normalizedParams.length > 0) {
        stmt.bind(normalizedParams);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return [rows, []];
    } catch (err) {
      const errMsg = String(err?.message || err || "");
      logger.error("SQLite SELECT query error: " + errMsg + " | SQL: " + adaptedSql);
      return [[], []];
    }
  } else {
    try {
      if (trimmedSql.startsWith("ALTER TABLE") && trimmedSql.includes("MODIFY COLUMN")) {
        return [{ insertId: 0, affectedRows: 0 }, []];
      }
      if (trimmedSql === "BEGIN" || trimmedSql === "BEGIN TRANSACTION") {
        try { db.run("BEGIN TRANSACTION"); } catch { /* ignore if active */ }
        return [{ insertId: 0, affectedRows: 0 }, []];
      }
      if (trimmedSql === "COMMIT") {
        try { db.run("COMMIT"); persistSqliteDb(); } catch { /* ignore if no active transaction */ }
        return [{ insertId: 0, affectedRows: 0 }, []];
      }
      if (trimmedSql === "ROLLBACK") {
        try { db.run("ROLLBACK"); } catch { /* ignore if no active transaction */ }
        return [{ insertId: 0, affectedRows: 0 }, []];
      }
      db.run(adaptedSql, normalizedParams || []);
      persistSqliteDb();
      const lastIdRes = db.exec("SELECT last_insert_rowid() as id");
      const lastId = lastIdRes[0]?.values[0]?.[0] || 0;
      const changesRes = db.exec("SELECT changes() as cnt");
      const affectedRows = changesRes[0]?.values[0]?.[0] || 0;

      return [{ insertId: lastId, affectedRows, changedRows: affectedRows }, []];
    } catch (err) {
      const errMsg = String(err?.message || err || "");
      if (
        errMsg.includes("UNIQUE constraint failed") ||
        errMsg.includes("duplicate column name") ||
        errMsg.includes("no transaction is active") ||
        errMsg.includes("cannot start a transaction")
      ) {
        return [{ insertId: 0, affectedRows: 0 }, []];
      }
      logger.error("SQLite EXEC query error: " + errMsg + " | SQL: " + adaptedSql);
      return [{ insertId: 0, affectedRows: 0 }, []];
    }
  }
}

// Universal Pool Proxy that works transparently with MySQL or SQLite fallback
const poolProxy = {
  async execute(sql, params) {
    if (isMysqlConnected && mysqlPool) {
      try {
        return await mysqlPool.execute(sql, params);
      } catch (err) {
        if (err.code === "ECONNREFUSED" || err.code === "PROTOCOL_CONNECTION_LOST") {
          isMysqlConnected = false;
          logger.warn("MySQL connection lost, switching to SQLite fallback pool");
        } else {
          throw err;
        }
      }
    }
    return executeSqliteQuery(sql, params);
  },

  async query(sql, params) {
    return this.execute(sql, params);
  },

  async getConnection() {
    if (isMysqlConnected && mysqlPool) {
      try {
        const conn = await mysqlPool.getConnection();
        return conn;
      } catch (err) {
        isMysqlConnected = false;
      }
    }

    // SQLite fallback mock connection
    return {
      async execute(sql, params) {
        return executeSqliteQuery(sql, params);
      },
      async query(sql, params) {
        return executeSqliteQuery(sql, params);
      },
      async beginTransaction() {
        return executeSqliteQuery("BEGIN TRANSACTION");
      },
      async commit() {
        return executeSqliteQuery("COMMIT");
      },
      async rollback() {
        return executeSqliteQuery("ROLLBACK");
      },
      release() {},
    };
  },
};

export async function connectDatabase() {
  if (mysqlPool) {
    try {
      const conn = await mysqlPool.getConnection();
      isMysqlConnected = true;
      logger.info("MySQL Database Connected Successfully");
      conn.release();
      return;
    } catch (error) {
      isMysqlConnected = false;
      logger.warn(
        "MySQL connection failed (" +
          (error.code || error.message || error) +
          "). Operating smoothly with SQLite in-memory database engine.",
      );
    }
  }
  // Initialize SQLite DB
  await getSqliteDb();
}

export default poolProxy;
