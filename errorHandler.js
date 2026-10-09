// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Global Error:", err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      message: "Validation Error",
      errors,
      success: false
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({
      message: `${field} already exists`,
      success: false
    })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: "Invalid ID format",
      success: false
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: "Invalid token",
      success: false
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: "Token expired",
      success: false
    })
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    success: false,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 404 handler for undefined routes
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`)
  error.status = 404
  next(error)
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}











