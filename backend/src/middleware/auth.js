import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import redisService from '../services/redisService.js';

dotenv.config();

// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'helpdesk-api',
  audience: 'helpdesk-users'
};

// Middleware to verify JWT token with enhanced security
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  // Check if token is blacklisted
  const isBlacklisted = await redisService.isTokenBlacklisted(token);
  if (isBlacklisted) {
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
    const session = await redisService.getSession(decoded.id, decoded.sessionId);
    if (!session) {
      return res.status(403).json({ 
        error: 'Session expired or invalid',
        code: 'INVALID_SESSION'
      });
    }

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
export const generateToken = async (user, tokenType = 'access') => {
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
    await redisService.storeSession(user.id, sessionId, {
      userId: user.id,
      sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      userAgent: null,
      ipAddress: null
    });
  }

  return { token, sessionId };
};

// Revoke token (logout)
export const revokeToken = async (token, sessionId, userId) => {
  if (token) {
    await redisService.blacklistToken(token);
  }
  
  if (sessionId && userId) {
    await redisService.deleteSession(userId, sessionId);
  }
};

// Middleware to track session information
export const trackSession = async (req, res, next) => {
  if (req.user && req.user.sessionId) {
    const session = await redisService.getSession(req.user.id, req.user.sessionId);
    
    if (session) {
      await redisService.storeSession(req.user.id, req.user.sessionId, {
        ...session,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        lastActivity: Date.now()
      });
    }
  }
  next();
};

// Validate JWT configuration
export const validateJWTConfig = () => {
  console.log('🔐 JWT_SECRET Debug:', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'undefined');
  
  if (!JWT_CONFIG.secret || 
      JWT_CONFIG.secret === 'your_super_secret_jwt_key_here' ||
      JWT_CONFIG.secret === 'demo_jwt_secret_key_for_testing_only_change_in_production_a1b2c3d4e5f6789012345678901234567890') {
    throw new Error('JWT_SECRET must be set to a secure random value');
  }
  
  if (JWT_CONFIG.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

// Get user sessions
export const getUserSessions = async (userId) => {
  const sessions = await redisService.getSession(userId, '*');
  return sessions || [];
};

// Revoke all user sessions
export const revokeAllUserSessions = async (userId) => {
  try {
    const sessions = await getUserSessions(userId);
    for (const session of sessions) {
      await redisService.deleteSession(userId, session.sessionId);
    }
    return true;
  } catch (error) {
    console.error('Error revoking all user sessions:', error);
    return false;
  }
};

export default {
  authenticateToken,
  requireAdmin,
  generateToken,
  revokeToken,
  trackSession,
  getUserSessions,
  revokeAllUserSessions,
  validateJWTConfig,
  JWT_CONFIG
};
