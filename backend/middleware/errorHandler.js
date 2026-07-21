const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.keyValue ? err.keyValue[field] : "";
  return new AppError(
    `Duplicate value for ${field}: "${value}". Please use another value.`,
    400,
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data: ${errors.join(". ")}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);
const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

const handleMulterError = (err) =>
  new AppError(err.message || "File upload error", 400);

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }
  // Unknown/programming error: don't leak details
  console.error("ERROR 💥", err);
  return res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong on our end. Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
    return;
  }

  // Safely clone the error — Object.create() can fail on certain error types
  // (e.g. Cloudinary errors with null prototype)
  let error;
  try {
    error = Object.create(err);
    error.message = err.message;
  } catch {
    error = new Error(err.message || "Unknown error");
    error.statusCode = err.statusCode || 500;
    error.status = err.status || "error";
  }

  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (error.name === "MulterError") error = handleMulterError(error);

  sendErrorProd(error, req, res);
};
