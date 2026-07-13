import dotenv from "dotenv"
dotenv.config()

const requiredEnv = [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "MAIL_HOST",
    "MAIL_PORT",
    "MAIL_USER",
    "MAIL_PASSWORD",
    "MAIL_FROM",
    "APP_URL",
];

requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing environment Variable: ${key}`)
    }
});

const env = {
    MODE_ENV: process.env.MODE_ENV || "development",

    PORT: Number(process.env.PORT),

    DB: {
        HOST: process.env.DB_HOST,
        PORT: process.env.DB_PORT,
        NAME: process.env.DB_NAME,
        USER: process.env.DB_USER,
        PASSWORD: process.env.DB_PASSWORD,
    },

    JWT: {
        ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
    },

    LOG_LEVEL: process.env.LOG_LEVEL || "info",

    MAIL: {

        HOST: process.env.MAIL_HOST,

        PORT: process.env.MAIL_PORT,

        USER: process.env.MAIL_USER,

        PASSWORD: process.env.MAIL_PASSWORD,

        FROM: process.env.MAIL_FROM

    },

    APP_URL: process.env.APP_URL,
};

export default env;