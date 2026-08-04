import logger from "../config/logger.js";

const errorMiddleWare = (
  err,
  req,
  res,
  next
) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`Client Error [${statusCode}]: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
};

export default errorMiddleWare;