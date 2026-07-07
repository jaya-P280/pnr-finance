import logger from "../config/logger.js"

const errorMiddleWare = (
    err,
    req,
    res,
    next
   )=>{
    logger.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success :false,
        message:err.message||"Internal Server Error",
        errors:
        err.errors||[]

    })
   }

export default errorMiddleWare;