const logger = (req, res, next) => {
  const start = Date.now()
  
  // Get request info
  const requestInfo = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    timestamp: new Date().toISOString(),
  }

  // Log the request
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 ${requestInfo.method} ${requestInfo.url} - ${requestInfo.ip}`)
  }

  // Override res.end to capture response info
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start
    const contentLength = res.get('Content-Length') || chunk?.length || 0
    
    // Determine log level based on status code
    let logLevel = '✅'
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = '⚠️'
    } else if (res.statusCode >= 500) {
      logLevel = '❌'
    }

    // Create response info
    const responseInfo = {
      ...requestInfo,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: `${contentLength}B`,
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${logLevel} ${responseInfo.method} ${responseInfo.url} - ${responseInfo.statusCode} - ${responseInfo.duration} - ${responseInfo.contentLength}`
      )
    }

    // Log errors and important events
    if (res.statusCode >= 400) {
      console.error('Request Error:', {
        ...responseInfo,
        body: req.body,
        params: req.params,
        query: req.query,
      })
    }

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn('Slow Request:', {
        ...responseInfo,
        warning: 'Request took longer than 1 second',
      })
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding)
  }

  next()
}

// Security headers logger
const securityLogger = (req, res, next) => {
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  // Check for missing security headers
  const missingHeaders = []
  Object.keys(securityHeaders).forEach(header => {
    if (!res.get(header)) {
      missingHeaders.push(header)
    }
  })

  if (missingHeaders.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('🔒 Missing Security Headers:', missingHeaders)
  }

  next()
}

// API usage logger
const apiUsageLogger = (req, res, next) => {
  if (req.user) {
    // Log API usage for authenticated users
    req.user.lastActiveAt = new Date()
    req.user.save().catch(err => {
      console.error('Failed to update user activity:', err)
    })
  }

  next()
}

module.exports = {
  logger,
  securityLogger,
  apiUsageLogger,
}

// Export default logger
module.exports = logger