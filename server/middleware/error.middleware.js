import logger from "../config/logger.js";

const errorMiddleWare = (
  err,
  req,
  res,
  next
) => {
  let statusCode = err.statusCode;
  let message = err.message;

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (!statusCode) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`Client Error [${statusCode}]: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: message || "Internal Server Error",
    errors: err.errors || [],
  });
};

export default errorMiddleWare;