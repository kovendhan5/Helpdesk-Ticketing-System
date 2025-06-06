import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'helpdesk-api',
  audience: 'helpdesk-users'
};

// Token blacklist (use Redis in production)
const tokenBlacklist = new Set();

// Session tracking
const activeSessions = new Map();

// Middleware to verify JWT token with enhanced security
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ 
      error: 'Token has been revoked',
      code: 'REVOKED_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });

    // Check if session is still active
    const sessionKey = `${decoded.id}:${decoded.sessionId}`;
    if (!activeSessions.has(sessionKey)) {
      return res.status(403).json({ 
        error: 'Session expired or invalid',
        code: 'INVALID_SESSION'
      });
    }

    // Update session activity
    activeSessions.set(sessionKey, {
      ...activeSessions.get(sessionKey),
      lastActivity: Date.now()
    });

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Invalid or expired token';

    if (err.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Token has expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorCode = 'MALFORMED_TOKEN';
      errorMessage = 'Malformed token';
    }

    return res.status(403).json({ 
      error: errorMessage,
      code: errorCode
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Administrator privileges required',
      code: 'INSUFFICIENT_PRIVILEGES'
    });
  }
  next();
};

// Generate enhanced JWT token with additional security claims
export const generateToken = (user, tokenType = 'access') => {
  const sessionId = crypto.randomUUID();
  const issuedAt = Math.floor(Date.now() / 1000);
  
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    sessionId,
    tokenType,
    iat: issuedAt,
    jti: crypto.randomUUID() // JWT ID for tracking
  };

  const expiry = tokenType === 'access' ? JWT_CONFIG.accessTokenExpiry : JWT_CONFIG.refreshTokenExpiry;
  
  const token = jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: expiry,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience
  });

  // Track active session
  if (tokenType === 'access') {
    const sessionKey = `${user.id}:${sessionId}`;
    activeSessions.set(sessionKey, {
      userId: user.id,
      sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      userAgent: null, // Set this when creating session
      ipAddress: null  // Set this when creating session
    });
  }

  return { token, sessionId };
};

// Revoke token (logout)
export const revokeToken = (token, sessionId, userId) => {
  if (token) {
    tokenBlacklist.add(token);
  }
  
  if (sessionId && userId) {
    const sessionKey = `${userId}:${sessionId}`;
    activeSessions.delete(sessionKey);
  }
};

// Revoke all user sessions
export const revokeAllUserSessions = (userId) => {
  for (const [sessionKey, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      activeSessions.delete(sessionKey);
    }
  }
};

// Clean expired sessions
export const cleanExpiredSessions = () => {
  const now = Date.now();
  const maxInactivity = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionKey, session] of activeSessions.entries()) {
    if (now - session.lastActivity > maxInactivity) {
      activeSessions.delete(sessionKey);
    }
  }
};

// Middleware to track session information
export const trackSession = (req, res, next) => {
  if (req.user && req.user.sessionId) {
    const sessionKey = `${req.user.id}:${req.user.sessionId}`;
    const session = activeSessions.get(sessionKey);
    
    if (session) {
      session.userAgent = req.get('User-Agent');
      session.ipAddress = req.ip || req.connection.remoteAddress;
      session.lastActivity = Date.now();
      activeSessions.set(sessionKey, session);
    }
  }
  next();
};

// Get user's active sessions
export const getUserSessions = (userId) => {
  const userSessions = [];
  
  for (const [sessionKey, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      userSessions.push({
        sessionId: session.sessionId,
        createdAt: new Date(session.createdAt),
        lastActivity: new Date(session.lastActivity),
        userAgent: session.userAgent,
        ipAddress: session.ipAddress
      });
    }
  }
  
  return userSessions;
};

// Validate JWT configuration
export const validateJWTConfig = () => {
  if (!JWT_CONFIG.secret || 
      JWT_CONFIG.secret === 'your_super_secret_jwt_key_here' ||
      JWT_CONFIG.secret === 'demo_jwt_secret_key_for_testing_only_change_in_production_a1b2c3d4e5f6789012345678901234567890') {
    throw new Error('JWT_SECRET must be set to a secure random value');
  }
  
  if (JWT_CONFIG.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

// Clean up interval (call this on server startup)
setInterval(cleanExpiredSessions, 60 * 60 * 1000); // Clean every hour

export default {
  authenticateToken,
  requireAdmin,
  generateToken,
  revokeToken,
  revokeAllUserSessions,
  trackSession,
  getUserSessions,
  validateJWTConfig,
  JWT_CONFIG
};
