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
    "JWT_REFRESH_SECRET"
];

requiredEnv.forEach((key)=>{
    if(!process.env[key]){
        throw new Error(`Missing environment Variable: ${key}`)
    }
});

const env = {
    MODE_ENV : process.env.MODE_ENV || "development",

    PORT : Number(process.env.PORT),

    DB:{
        HOST : process.env.DB_HOST,
        PORT : process.env.DB_PORT,
        NAME : process.env.DB_NAME,
        USER : process.env.DB_USER,
        PASSWORD : process.env.DB_PASSWORD,
    },

    JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
    REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
  },

  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};

export default env;