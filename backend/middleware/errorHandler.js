const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  })

  let error = { ...err }
  error.message = err.message

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = {
      message,
      statusCode: 404,
    }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered'
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0]
    if (field === 'email') {
      message = 'Email address is already registered'
    } else if (field === 'phone') {
      message = 'Phone number is already registered'
    }
    
    error = {
      message,
      statusCode: 400,
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = {
      message,
      statusCode: 400,
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
    }
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
    }
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large',
      statusCode: 400,
    }
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      statusCode: 400,
    }
  }

  // Express validator errors
  if (err.array && typeof err.array === 'function') {
    const messages = err.array().map(error => error.msg)
    error = {
      message: messages.join(', '),
      statusCode: 400,
    }
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429,
    }
  }

  // Database connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    error = {
      message: 'Database connection error',
      statusCode: 500,
    }
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500
  const message = error.message || 'Server Error'

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
    timestamp: new Date().toISOString(),
  })
}

module.exports = errorHandler