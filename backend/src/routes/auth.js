import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { generateToken, revokeToken, trackSession, getUserSessions, revokeAllUserSessions } from '../middleware/auth.js';
import { validatePassword, hashPassword } from '../utils/passwordValidator.js';
import { loginRateLimiter, sanitizeInput } from '../middleware/security.js';

const router = express.Router();

// Apply security middleware
router.use(sanitizeInput());

// Enhanced user registration with password validation
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address',
        code: 'INVALID_EMAIL'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.success) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        code: 'WEAK_PASSWORD',
        details: passwordValidation.errors,
        warnings: passwordValidation.warnings,
        requirements: passwordValidation.requirements
      });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role specified',
        code: 'INVALID_ROLE'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'An account with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password with enhanced security
    const hashedPassword = await hashPassword(password, 12);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (email, password, role, created_at, last_login) VALUES ($1, $2, $3, NOW(), NULL) RETURNING id, email, role, created_at',
      [email.toLowerCase(), hashedPassword, role]
    );

    // Log security event
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'user_registration',
      email: email.toLowerCase(),
      role,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }));

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Enhanced login with rate limiting and security monitoring
router.post('/login', loginRateLimiter(), async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user in database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      // Use generic error message to prevent email enumeration
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }    const user = result.rows[0];

    // Note: Account locking features would require additional database columns
    // For now, we'll skip the account lock check

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'login_failure',
        email: email.toLowerCase(),
        reason: 'invalid_password',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }));

      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }    // Generate enhanced JWT tokens
    const { token, sessionId } = generateToken(user, 'access');
    const refreshTokenData = generateToken(user, 'refresh');
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Log successful login
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'login_success',
      userId: user.id,
      email: email.toLowerCase(),
      sessionId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }));

    res.json({
      message: 'Login successful',
      token,
      refreshToken: refreshTokenData.token,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lastLogin: user.last_login
      },
      expiresIn: rememberMe ? '7d' : '15m'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.',
      code: 'LOGIN_ERROR'
    });
  }
});

// Enhanced logout with session management
router.post('/logout', trackSession, async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const { sessionId } = req.body;
    
    // Get user info from token (if valid)
    let userId = null;
    if (req.user) {
      userId = req.user.id;
    }

    // Revoke the token and session
    revokeToken(token, sessionId, userId);

    // Log logout event
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'logout',
      userId,
      sessionId,
      ip: req.ip || req.connection.remoteAddress
    }));

    res.json({ 
      message: 'Logged out successfully',
      code: 'LOGOUT_SUCCESS'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Get user's active sessions
router.get('/sessions', trackSession, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const sessions = getUserSessions(req.user.id);
    
    res.json({
      sessions,
      currentSessionId: req.user.sessionId
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      code: 'SESSIONS_ERROR'
    });
  }
});

// Revoke all sessions (security action)
router.post('/revoke-all-sessions', trackSession, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    revokeAllUserSessions(req.user.id);

    // Log security action
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'all_sessions_revoked',
      userId: req.user.id,
      ip: req.ip || req.connection.remoteAddress
    }));

    res.json({ 
      message: 'All sessions revoked successfully',
      code: 'ALL_SESSIONS_REVOKED'
    });
  } catch (error) {
    console.error('Session revocation error:', error);
    res.status(500).json({ 
      error: 'Failed to revoke sessions',
      code: 'REVOCATION_ERROR'
    });
  }
});

// Change password endpoint
router.post('/change-password', trackSession, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS'
      });
    }

    // Get current user data
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.success) {
      return res.status(400).json({
        error: 'New password does not meet security requirements',
        code: 'WEAK_PASSWORD',
        details: passwordValidation.errors,
        warnings: passwordValidation.warnings,
        requirements: passwordValidation.requirements
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        error: 'New password must be different from current password',
        code: 'SAME_PASSWORD'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword, 12);

    // Update password in database
    await pool.query(
      'UPDATE users SET password = $1, password_changed_at = NOW() WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    // Revoke all other sessions for security
    revokeAllUserSessions(req.user.id);

    // Log password change
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'password_changed',
      userId: req.user.id,
      ip: req.ip || req.connection.remoteAddress
    }));

    res.json({
      message: 'Password changed successfully. Please log in again.',
      code: 'PASSWORD_CHANGED'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      error: 'Failed to change password',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

export default router;
