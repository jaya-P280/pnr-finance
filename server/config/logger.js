import winston from "winston";
import fs from "fs";
import path from "path";
import env from "./env.js";

const isVercel = Boolean(process.env.VERCEL);
const transports = [new winston.transports.Console()];

if (!isVercel) {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
        try {
            fs.mkdirSync(logDir, { recursive: true });
        } catch {
            // ignore
        }
    }

    if (fs.existsSync(logDir)) {
        try {
            transports.push(
                new winston.transports.File({
                    filename: path.join(logDir, "error.log"),
                    level: "error",
                }),
                new winston.transports.File({
                    filename: path.join(logDir, "combined.log"),
                })
            );
        } catch {
            // ignore
        }
    }
}

const logger = winston.createLogger({
    level: env.LOG_LEVEL || "info",

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()} : ${message}`;
        })
    ),

    transports,
});

export default logger;