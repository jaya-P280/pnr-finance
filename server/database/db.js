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

function isMalformedError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("malformed") ||
    msg.includes("corrupt") ||
    msg.includes("file is not a database") ||
    msg.includes("disk i/o error")
  );
}

function deleteSqliteFile() {
  sqliteDb = null;
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      fs.unlinkSync(DB_FILE_PATH);
      logger.warn("Deleted corrupted SQLite database file at: " + DB_FILE_PATH);
    }
  } catch (err) {
    logger.error("Failed to delete SQLite database file: " + (err?.message || err));
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
      const checkRes = db.exec("PRAGMA integrity_check");
      const checkVal = checkRes[0]?.values[0]?.[0];
      if (checkVal !== "ok") {
        throw new Error("Integrity check failed: " + checkVal);
      }
      logger.info("Loaded SQLite database from file: " + DB_FILE_PATH);
    } catch (err) {
      logger.warn("Corrupted or invalid SQLite database file detected, resetting database: " + (err?.message || err));
      deleteSqliteFile();
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  const reg = (name, fn) => {
    try {
      db.create_function(name.toUpperCase(), fn);
      db.create_function(name.toLowerCase(), fn);
    } catch {
      // ignore registration errors if function already exists
    }
  };

  // Register MySQL helper functions in SQLite
  reg("CONCAT", (a, b, c, d, e, f, g, h) =>
    [a, b, c, d, e, f, g, h]
      .filter((x) => x !== undefined && x !== null)
      .join("")
  );

  reg("NOW", () => new Date().toISOString().replace("T", " ").slice(0, 19));
  reg("CURDATE", () => new Date().toISOString().split("T")[0]);
  reg("IF", (cond, valTrue, valFalse) => (cond ? valTrue : valFalse));

  reg("DATE_FORMAT", (date, fmt) => {
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

  reg("DATEDIFF", (d1, d2) => {
    if (!d1 || !d2) return 0;
    const diff = new Date(d1).getTime() - new Date(d2).getTime();
    return Math.round(diff / (1000 * 3600 * 24));
  });

  reg("MONTH", (d) => (d ? new Date(d).getMonth() + 1 : null));
  reg("YEAR", (d) => (d ? new Date(d).getFullYear() : null));
  reg("DATE", (d) => (d ? String(d).split("T")[0].split(" ")[0] : null));

  sqliteDb = db;
  return sqliteDb;
}

function splitTopLevelCommas(str) {
  const parts = [];
  let current = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === "(") depth++;
      else if (char === ")") depth--;
      else if (char === "," && depth === 0) {
        parts.push(current);
        current = "";
        continue;
      }
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

function replaceFunc(sql, funcName, replacer) {
  const regex = new RegExp("\\b" + funcName + "\\s*\\(", "gi");
  let result = "";
  let lastIdx = 0;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const startIdx = match.index;
    const argStart = regex.lastIndex;
    let depth = 1;
    let i = argStart;
    while (i < sql.length && depth > 0) {
      if (sql[i] === "(") depth++;
      else if (sql[i] === ")") depth--;
      i++;
    }
    if (depth === 0) {
      const argsStr = sql.slice(argStart, i - 1);
      const replacement = replacer(argsStr);
      result += sql.slice(lastIdx, startIdx) + replacement;
      lastIdx = i;
      regex.lastIndex = i;
    }
  }
  result += sql.slice(lastIdx);
  return result;
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
    .replace(/DATE_SUB\s*\(\s*([^,]+)\s*,\s*INTERVAL\s+\?\s+(\w+)\s*\)/gi, "date($1, '-' || ? || ' $2')")
    .replace(/CURDATE\(\)/gi, "date('now')")
    .replace(/CURDATE\b/gi, "date('now')")
    .replace(/NOW\(\)/gi, "datetime('now')");

  adapted = replaceFunc(adapted, "MONTH", (arg) => {
    const cleanArg = arg.trim() === "date('now')" ? "'now'" : arg;
    return `CAST(strftime('%m', ${cleanArg}) AS INTEGER)`;
  });

  adapted = replaceFunc(adapted, "YEAR", (arg) => {
    const cleanArg = arg.trim() === "date('now')" ? "'now'" : arg;
    return `CAST(strftime('%Y', ${cleanArg}) AS INTEGER)`;
  });

  adapted = replaceFunc(adapted, "DATE_FORMAT", (argsStr) => {
    const parts = splitTopLevelCommas(argsStr);
    const expr = parts[0].trim();
    let fmt = parts.slice(1).join(",").trim();
    const cleanExpr = expr === "date('now')" ? "'now'" : expr;
    if (fmt === "'%Y-%m'" || fmt === '"%Y-%m"') return `strftime('%Y-%m', ${cleanExpr})`;
    if (fmt === "'%Y-%m-%d'" || fmt === '"%Y-%m-%d"') return `strftime('%Y-%m-%d', ${cleanExpr})`;
    return `strftime(${fmt}, ${cleanExpr})`;
  });

  adapted = replaceFunc(adapted, "CONCAT", (argsStr) => {
    const parts = splitTopLevelCommas(argsStr).map((p) => `COALESCE(${p.trim()}, '')`);
    return `(${parts.join(" || ")})`;
  });

  if (adapted.trim().toUpperCase().startsWith("CREATE TABLE")) {
    const cleanedForMatch = adapted.replace(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?/i, "CREATE TABLE ");
    const match = cleanedForMatch.match(/CREATE\s+TABLE\s+([`\w_]+)\s*\(([\s\S]+)\)/i);
    if (match) {
      const tableName = match[1].replace(/[`"']/g, "");
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
    if (p === undefined) return null;
    if (typeof p === "number" && isNaN(p)) return 0;
    if (p instanceof Date) {
      return p.toISOString().replace("T", " ").slice(0, 19);
    }
    return p;
  });

  if (trimmedSql.includes("INFORMATION_SCHEMA")) {
    try {
      if (normalizedParams && normalizedParams.length >= 2) {
        const tableName = normalizedParams[0];
        const colName = normalizedParams[1];
        if (tableName && colName) {
          const checkRes = db.exec(`PRAGMA table_info(${tableName})`);
          const cols = checkRes[0]?.values?.map((v) => String(v[1]).toLowerCase()) || [];
          if (cols.includes(String(colName).toLowerCase())) {
            return [[{ 1: 1 }], []];
          }
        }
      }
    } catch {
      // ignore
    }
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
      if (isMalformedError(err)) {
        logger.error("SQLite SELECT error due to corruption: " + errMsg);
        deleteSqliteFile();
        throw err;
      }
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
      if (isMalformedError(err)) {
        logger.error("SQLite EXEC error due to corruption: " + errMsg);
        deleteSqliteFile();
        throw err;
      }
      if (
        errMsg.includes("UNIQUE constraint failed") ||
        errMsg.includes("duplicate column name") ||
        errMsg.includes("no transaction is active") ||
        errMsg.includes("cannot start a transaction")
      ) {
        return [{ insertId: 0, affectedRows: 0 }, []];
      }
      logger.error("SQLite EXEC query error: " + errMsg + " | SQL: " + adaptedSql);
      throw err;
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
