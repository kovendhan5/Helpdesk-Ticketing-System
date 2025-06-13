import crypto from 'crypto';

/**
 * Security middleware collection following OWASP best practices
 */

// In-memory store for rate limiting and login attempts (use Redis in production)
const loginAttempts = new Map();
const ipRequests = new Map();
// Advanced security tracking
const sessionStore = new Map();
const suspiciousActivity = new Map();
const ipGeolocation = new Map();

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Express middleware
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 5, // Production default: 5 attempts
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false
  } = options;

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean old entries
    for (const [key, data] of ipRequests.entries()) {
      if (now - data.windowStart > windowMs) {
        ipRequests.delete(key);
      }
    }

    if (!ipRequests.has(identifier)) {
      ipRequests.set(identifier, {
        count: 1,
        windowStart: now
      });
      return next();
    }

    const requestData = ipRequests.get(identifier);
    
    // Reset window if expired
    if (now - requestData.windowStart > windowMs) {
      requestData.count = 1;
      requestData.windowStart = now;
      return next();
    }

    // Check if limit exceeded
    if (requestData.count >= maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((requestData.windowStart + windowMs - now) / 1000)
      });
    }

    // Increment counter
    requestData.count++;
    next();
  };
}

/**
 * Login attempt rate limiting
 * @param {Object} options - Login rate limiting options
 * @returns {Function} - Express middleware
 */
export function loginRateLimiter(options = {}) {
  const {
    maxAttempts = 5, // Reduced back to 5 for production security
    lockoutTime = 15 * 60 * 1000, // 15 minutes
    windowMs = 60 * 60 * 1000 // 1 hour
  } = options;

  return (req, res, next) => {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const identifier = `${email || 'unknown'}:${ip}`;
    const now = Date.now();

    // Clean old entries
    for (const [key, data] of loginAttempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        loginAttempts.delete(key);
      }
    }

    const attempts = loginAttempts.get(identifier);

    if (attempts) {
      // Check if still locked out
      if (attempts.lockedUntil && now < attempts.lockedUntil) {
        const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000);
        return res.status(429).json({
          error: 'Account temporarily locked due to too many failed login attempts',
          retryAfter: remainingTime,
          lockedUntil: new Date(attempts.lockedUntil).toISOString()
        });
      }

      // Reset if lockout period has passed
      if (attempts.lockedUntil && now >= attempts.lockedUntil) {
        loginAttempts.delete(identifier);
      }
    }

    // Store original end function to intercept response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // Check if login failed (status 401 or 400)
      if (res.statusCode === 401 || res.statusCode === 400) {
        handleFailedLogin(identifier, maxAttempts, lockoutTime, now);
      } else if (res.statusCode === 200) {
        // Login successful, clear attempts
        loginAttempts.delete(identifier);
      }
      
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Handle failed login attempt
 * @param {string} identifier - Login identifier
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} lockoutTime - Lockout duration in ms
 * @param {number} now - Current timestamp
 */
function handleFailedLogin(identifier, maxAttempts, lockoutTime, now) {
  const attempts = loginAttempts.get(identifier) || {
    count: 0,
    firstAttempt: now
  };

  attempts.count++;
  attempts.lastAttempt = now;

  if (attempts.count >= maxAttempts) {
    attempts.lockedUntil = now + lockoutTime;
  }

  loginAttempts.set(identifier, attempts);
}

/**
 * Input sanitization middleware
 * @param {Function} next - Next middleware
 * @returns {Function} - Express middleware
 */
export function sanitizeInput() {
  return (req, res, next) => {
    // Sanitize string inputs
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Remove potential XSS patterns
          obj[key] = obj[key]
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
  };
}

/**
 * Security headers middleware
 * @returns {Function} - Express middleware
 */
export function securityHeaders() {
  return (req, res, next) => {
    // Security headers following OWASP guidelines
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
    );

    // Remove server information
    res.removeHeader('X-Powered-By');

    next();
  };
}

/**
 * Request logging middleware for security monitoring
 * @returns {Function} - Express middleware
 */
export function securityLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log security-relevant events
    const logSecurityEvent = (event, details = {}) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.url,
        ...details
      }));
    };

    // Override end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      // Log suspicious activities
      if (res.statusCode >= 400) {
        logSecurityEvent('http_error', {
          statusCode: res.statusCode,
          duration
        });
      }

      if (req.url.includes('/auth/login')) {
        logSecurityEvent('login_attempt', {
          statusCode: res.statusCode,
          success: res.statusCode === 200,
          duration
        });
      }

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Generate secure CSRF token
 * @returns {string} - CSRF token
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 * @returns {Function} - Express middleware
 */
export function csrfProtection() {
  return (req, res, next) => {
    // Skip CSRF for GET requests and login/register
    if (req.method === 'GET' || 
        req.path === '/api/auth/login' || 
        req.path === '/api/auth/register') {
      return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({
        error: 'Invalid CSRF token'
      });
    }

    next();
  };
}

/**
 * Enhanced session management middleware
 */
export function sessionManagement() {
  return (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || crypto.randomUUID();
    const userId = req.user?.id;
    const ip = req.ip || req.connection.remoteAddress;
    
    if (userId) {
      const sessionKey = `${userId}:${sessionId}`;
      const now = Date.now();
      
      // Check for concurrent session limits
      const userSessions = Array.from(sessionStore.entries())
        .filter(([key]) => key.startsWith(`${userId}:`));
      
      const maxConcurrentSessions = parseInt(process.env.SESSION_MAX_CONCURRENT) || 3;
      
      if (userSessions.length >= maxConcurrentSessions) {
        // Remove oldest session
        const oldestSession = userSessions
          .sort(([,a], [,b]) => a.lastActivity - b.lastActivity)[0];
        if (oldestSession) {
          sessionStore.delete(oldestSession[0]);
        }
      }
      
      // Update session info
      sessionStore.set(sessionKey, {
        userId,
        ip,
        userAgent: req.headers['user-agent'],
        lastActivity: now,
        createdAt: sessionStore.get(sessionKey)?.createdAt || now
      });
      
      req.sessionId = sessionId;
    }
    
    next();
  };
}

/**
 * Intrusion detection middleware
 */
export function intrusionDetection() {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const now = Date.now();
    
    // Track suspicious patterns
    const suspiciousPatterns = [
      /sql.*inject/i,
      /<script.*>/i,
      /union.*select/i,
      /\.\.\/.*\.\.\//,
      /eval\s*\(/i,
      /document\.cookie/i
    ];
    
    const requestString = `${req.url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)}`;
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
    
    if (isSuspicious) {
      if (!suspiciousActivity.has(ip)) {
        suspiciousActivity.set(ip, { count: 0, firstSeen: now, patterns: [] });
      }
      
      const activity = suspiciousActivity.get(ip);
      activity.count++;
      activity.lastSeen = now;
      activity.patterns.push({
        url: req.url,
        method: req.method,
        timestamp: now,
        userAgent
      });
      
      // Log security event
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'suspicious_activity_detected',
        ip,
        url: req.url,
        method: req.method,
        userAgent,
        pattern: 'injection_attempt'
      }));
      
      // Block if too many suspicious attempts
      if (activity.count > 5) {
        return res.status(403).json({
          error: 'Suspicious activity detected. Access denied.',
          code: 'SECURITY_VIOLATION'
        });
      }
    }
    
    next();
  };
}

/**
 * Advanced request validation middleware
 */
export function advancedRequestValidation() {
  return (req, res, next) => {
    // Request size validation
    const maxRequestSize = parseInt(process.env.REQUEST_SIZE_LIMIT) || 10485760; // 10MB
    const contentLength = parseInt(req.headers['content-length']) || 0;
    
    if (contentLength > maxRequestSize) {
      return res.status(413).json({
        error: 'Request too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: maxRequestSize
      });
    }
    
    // Request timeout validation
    const requestStartTime = Date.now();
    const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000; // 30 seconds
    
    const timeoutHandler = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          code: 'REQUEST_TIMEOUT'
        });
      }
    }, timeout);
    
    res.on('finish', () => {
      clearTimeout(timeoutHandler);
    });
    
    // Enhanced header validation
    const requiredHeaders = ['user-agent', 'accept'];
    const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
    
    if (missingHeaders.length > 0 && process.env.REQUEST_VALIDATION_STRICT === 'true') {
      return res.status(400).json({
        error: 'Missing required headers',
        code: 'MISSING_HEADERS',
        missing: missingHeaders
      });
    }
    
    req.requestStartTime = requestStartTime;
    next();
  };
}

/**
 * API versioning middleware
 */
export function apiVersioning() {
  return (req, res, next) => {
    const apiVersion = req.headers['api-version'] || process.env.API_VERSION || 'v1';
    const supportedVersions = ['v1'];
    
    if (!supportedVersions.includes(apiVersion)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        code: 'UNSUPPORTED_VERSION',
        supported: supportedVersions,
        requested: apiVersion
      });
    }
    
    req.apiVersion = apiVersion;
    res.setHeader('API-Version', apiVersion);
    next();
  };
}

/**
 * Enhanced security logging middleware
 */
export function enhancedSecurityLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const sessionId = req.sessionId;
    const userId = req.user?.id;
    
    // Log request details if security logging is enabled
    if (process.env.LOG_SECURITY_EVENTS === 'true') {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'http_request',
        method: req.method,
        url: req.url,
        ip,
        userAgent,
        sessionId,
        userId,
        headers: {
          'content-length': req.headers['content-length'],
          'content-type': req.headers['content-type'],
          'authorization': req.headers.authorization ? '[PRESENT]' : '[ABSENT]'
        }
      }));
    }
    
    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log security-relevant responses
      if (process.env.LOG_SECURITY_EVENTS === 'true') {
        const isSecurityEvent = req.url.includes('/auth/') || 
                               res.statusCode >= 400 ||
                               req.method !== 'GET';
        
        if (isSecurityEvent) {
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: 'http_response',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            ip,
            userId,
            sessionId,
            hasError: res.statusCode >= 400
          }));
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Geolocation-based access control (basic implementation)
 */
export function geolocationSecurity() {
  return (req, res, next) => {
    if (process.env.GEO_BLOCKING_ENABLED !== 'true') {
      return next();
    }
    
    const ip = req.ip || req.connection.remoteAddress;
    const allowedCountries = (process.env.ALLOWED_COUNTRIES || '').split(',');
    const blockedCountries = (process.env.BLOCKED_COUNTRIES || '').split(',');
    
    // Simple implementation - in production, use a proper geolocation service
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');
    
    if (isLocalhost) {
      return next(); // Allow localhost
    }
    
    // For demo purposes, we'll allow all non-localhost IPs
    // In production, integrate with a geolocation service
    next();
  };
}

export default {
  createRateLimiter,
  loginRateLimiter,
  sanitizeInput,
  securityHeaders,
  securityLogger,
  generateCSRFToken,
  csrfProtection,
  sessionManagement,
  intrusionDetection,
  advancedRequestValidation,
  apiVersioning,
  enhancedSecurityLogger,
  geolocationSecurity
};
