export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Validation errors from express-validator
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    
    return res.status(400).json({
      success: false,
      message: "Validation error",
      code: "VALIDATION_ERROR",
      errors,
    });
  }

  // Unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      code: "DUPLICATE_ENTRY",
      field,
    });
  }

  // Foreign key constraint errors (referential integrity)
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference. Related record does not exist.",
      code: "INVALID_REFERENCE",
    });
  }

  // Database connection errors
  if (err.name === "SequelizeConnectionError") {
    return res.status(503).json({
      success: false,
      message: "Database connection error. Please try again later.",
      code: "DATABASE_ERROR",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // Custom errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || "ERROR",
    });
  }

  // Generic server errors (sanitized)
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later.",
    code: "INTERNAL_ERROR",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
