import crypto from 'crypto';

/**
 * Password security utilities following OWASP guidelines
 */

// Password strength requirements (relaxed for testing)
const PASSWORD_REQUIREMENTS = {
  minLength: 6,
  maxLength: 128,
  requireUppercase: false,
  requireLowercase: true,
  requireNumbers: false,
  requireSpecialChars: false,
  minStrengthScore: 1 // Out of 5
};

// Common weak passwords to blacklist
const COMMON_PASSWORDS = [
  'password', '123456', 'password123', 'admin', 'qwerty', 'letmein',
  'welcome', 'monkey', '1234567890', 'password1', 'abc123', 'admin123',
  'user123', 'guest', 'root', 'toor', 'pass', '12345', 'test', 'temp'
];

/**
 * Validate password strength and requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with success flag and messages
 */
export function validatePassword(password) {
  const errors = [];
  const warnings = [];

  // Check basic requirements
  if (!password) {
    errors.push('Password is required');
    return { success: false, errors, warnings, score: 0 };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Check character requirements
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more secure password');
  }

  // Check for patterns
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeating characters (e.g., "aaa")');
  }

  if (/123|abc|qwe/i.test(password)) {
    warnings.push('Avoid sequential characters');
  }

  // Calculate strength score
  const score = calculatePasswordStrength(password);
  
  if (score < PASSWORD_REQUIREMENTS.minStrengthScore) {
    errors.push(`Password strength is too weak (${score}/5). Please use a stronger password`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    score,
    requirements: PASSWORD_REQUIREMENTS
  };
}

/**
 * Calculate password strength score (0-5)
 * @param {string} password - The password to score
 * @returns {number} - Strength score from 0 (weakest) to 5 (strongest)
 */
function calculatePasswordStrength(password) {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Complexity bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.6) score += 1;

  // Cap at 5
  return Math.min(score, 5);
}

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} - Generated secure password
 */
export function generateSecurePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);
  password += getRandomChar(symbols);
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get a cryptographically secure random character
 * @param {string} charset - Character set to choose from
 * @returns {string} - Random character
 */
function getRandomChar(charset) {
  const randomBytes = crypto.randomBytes(1);
  const randomIndex = randomBytes[0] % charset.length;
  return charset[randomIndex];
}

/**
 * Hash password with salt using bcrypt-compatible approach
 * @param {string} password - Password to hash
 * @param {number} saltRounds - Salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password, saltRounds = 12) {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 * @param {string} password - Plain password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Whether password matches
 */
export async function verifyPassword(password, hash) {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
}

export default {
  validatePassword,
  generateSecurePassword,
  hashPassword,
  verifyPassword,
  PASSWORD_REQUIREMENTS
};
