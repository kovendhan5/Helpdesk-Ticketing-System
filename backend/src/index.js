import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import pool, { initializeDatabase } from './db.js';
import { validateJWTConfig } from './middleware/auth.js';
import {
  createRateLimiter,
  sanitizeInput,
  securityHeaders,
  securityLogger
} from './middleware/security.js';
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';

// Load environment variables
dotenv.config();

// Validate critical security configuration
try {
  validateJWTConfig();
} catch (error) {
  console.error('❌ Security configuration error:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware (applied first)
app.use(securityLogger());
app.use(securityHeaders());

// Enhanced Helmet configuration for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration with enhanced security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'https://your-production-domain.com' // Replace with your actual domain
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting for different endpoints - Increased limits for testing
app.use('/api/auth/login', createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Increased from 5 to 100 attempts per window
  message: 'Too many login attempts, please try again later'
}));

app.use('/api/auth/register', createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // Increased from 3 to 50 registration attempts per hour
  message: 'Too many registration attempts, please try again later'
}));

app.use('/api', createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // Increased from 100 to 1000 requests per window for general API
  message: 'Too many API requests, please try again later'
}));

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Input sanitization
app.use(sanitizeInput());

// Health check endpoint (before authentication)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Security endpoint for CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ csrfToken: token });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log error for monitoring
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'application_error',
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }));

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production - log and continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database connection successful');
    console.log('✅ Database tables initialized successfully');

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 API endpoints: http://localhost:${PORT}/api`);
      console.log(`🛡️  Security features enabled:`);
      console.log(`   • Rate limiting active`);
      console.log(`   • Security headers configured`);
      console.log(`   • Input sanitization enabled`);
      console.log(`   • CORS protection active`);
      console.log(`   • JWT validation enhanced`);
      console.log(`   • Password strength validation enabled`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️  Development mode: Some security features relaxed`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
