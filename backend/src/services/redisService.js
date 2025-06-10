// Redis service for token storage and session management
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

// Redis configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  keyPrefix: 'helpdesk:',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis client
let redisClient;
try {
  redisClient = new Redis(REDIS_CONFIG);
  console.log('Redis client initialized');
  
  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });
  
  redisClient.on('connect', () => {
    console.log('Connected to Redis server');
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  console.warn('Using fallback in-memory storage for tokens. THIS IS NOT RECOMMENDED FOR PRODUCTION!');
}

// Token expiration times in seconds
const TOKEN_EXPIRY = {
  access: 15 * 60, // 15 minutes
  refresh: 7 * 24 * 60 * 60, // 7 days
  blacklist: 24 * 60 * 60 // 24 hours (store blacklisted tokens for their max possible lifetime)
};

// Fallback in-memory storage if Redis is not available
const memoryStorage = {
  tokens: new Map(),
  sessions: new Map()
};

// Add a token to the blacklist
export const blacklistToken = async (token, tokenType = 'access') => {
  const key = `blacklist:${token}`;
  
  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.set(key, '1', 'EX', TOKEN_EXPIRY[tokenType]);
      return true;
    } else {
      // Fallback to in-memory storage
      memoryStorage.tokens.set(key, {
        value: '1',
        expiry: Date.now() + (TOKEN_EXPIRY[tokenType] * 1000)
      });
      return true;
    }
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

// Check if a token is blacklisted
export const isTokenBlacklisted = async (token) => {
  const key = `blacklist:${token}`;
  
  try {
    if (redisClient && redisClient.status === 'ready') {
      const result = await redisClient.get(key);
      return result !== null;
    } else {
      // Fallback to in-memory storage
      const item = memoryStorage.tokens.get(key);
      
      // Clean expired tokens
      if (item && item.expiry < Date.now()) {
        memoryStorage.tokens.delete(key);
        return false;
      }
      
      return item !== undefined;
    }
  } catch (error) {
    console.error('Error checking blacklisted token:', error);
    return false; // Default to allowing tokens if checking fails
  }
};

// Store an active session
export const storeSession = async (userId, sessionId, metadata) => {
  const key = `session:${userId}:${sessionId}`;
  
  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.hmset(key, {
        ...metadata,
        lastActivity: Date.now()
      });
      await redisClient.expire(key, TOKEN_EXPIRY.refresh);
      return true;
    } else {
      // Fallback to in-memory storage
      memoryStorage.sessions.set(key, {
        data: {
          ...metadata,
          lastActivity: Date.now()
        },
        expiry: Date.now() + (TOKEN_EXPIRY.refresh * 1000)
      });
      return true;
    }
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
};

// Get session data
export const getSession = async (userId, sessionId) => {
  const key = `session:${userId}:${sessionId}`;
  
  try {
    if (redisClient && redisClient.status === 'ready') {
      const session = await redisClient.hgetall(key);
      
      if (Object.keys(session).length === 0) {
        return null; // Session not found
      }
      
      // Update last activity
      await redisClient.hset(key, 'lastActivity', Date.now());
      await redisClient.expire(key, TOKEN_EXPIRY.refresh); // Extend expiry
      
      return session;
    } else {
      // Fallback to in-memory storage
      const item = memoryStorage.sessions.get(key);
      
      // Clean expired sessions
      if (item && item.expiry < Date.now()) {
        memoryStorage.sessions.delete(key);
        return null;
      }
      
      if (item) {
        // Update last activity
        item.data.lastActivity = Date.now();
        item.expiry = Date.now() + (TOKEN_EXPIRY.refresh * 1000);
        return item.data;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Delete a session
export const deleteSession = async (userId, sessionId) => {
  const key = `session:${userId}:${sessionId}`;
  
  try {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.del(key);
      return true;
    } else {
      // Fallback to in-memory storage
      memoryStorage.sessions.delete(key);
      return true;
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
};

// Clean up expired items from memory storage
setInterval(() => {
  if (!redisClient || redisClient.status !== 'ready') {
    const now = Date.now();
    
    // Clean tokens
    for (const [key, item] of memoryStorage.tokens.entries()) {
      if (item.expiry < now) {
        memoryStorage.tokens.delete(key);
      }
    }
    
    // Clean sessions
    for (const [key, item] of memoryStorage.sessions.entries()) {
      if (item.expiry < now) {
        memoryStorage.sessions.delete(key);
      }
    }
  }
}, 60000); // Run every minute

export default {
  blacklistToken,
  isTokenBlacklisted,
  storeSession,
  getSession,
  deleteSession
};
