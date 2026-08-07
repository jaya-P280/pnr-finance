import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from server directory first, fallback to root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config()

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;

const env = {
    MODE_ENV: process.env.MODE_ENV || "development",

    PORT: Number(process.env.PORT) || 3000,

    DB: {
        URL: dbUrl || null,
        HOST: process.env.DB_HOST || process.env.MYSQLHOST || null,
        PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306),
        NAME: process.env.DB_NAME || process.env.MYSQLDATABASE || null,
        USER: (!process.env.DB_USER || process.env.DB_USER === "DB_USER") ? (process.env.MYSQLUSER || "avnadmin") : process.env.DB_USER,
        PASSWORD: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
    },

    JWT: {
        ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "default_access_secret_pnr_finance_2026",
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_pnr_finance_2026",
        ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
        REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
    },

    LOG_LEVEL: process.env.LOG_LEVEL || "info",

    MAIL: {
        HOST: process.env.MAIL_HOST || "smtp.gmail.com",
        PORT: Number(process.env.MAIL_PORT) || 587,
        USER: process.env.MAIL_USER || "",
        PASSWORD: process.env.MAIL_PASSWORD || "",
        FROM: process.env.MAIL_FROM || "noreply@pnrfinance.com"
    },

    APP_URL: process.env.APP_URL || "http://localhost:3000",
};

export default env;