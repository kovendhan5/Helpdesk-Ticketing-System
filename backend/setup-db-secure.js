import pool from './src/db.js';
import { generateSecurePassword, hashPassword } from './src/utils/passwordValidator.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    console.log('✅ Database connection successful');

    // Create tables (already handled by db.js initializeDatabase)
    console.log('✅ Database tables created');

    // Generate secure demo passwords
    const adminPassword = generateSecurePassword(16);
    const userPassword = generateSecurePassword(16);

    // Create demo admin user with secure password
    const adminEmail = 'admin@example.com';
    
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await hashPassword(adminPassword, 12);
      await pool.query(
        'INSERT INTO users (email, password, role, created_at) VALUES ($1, $2, $3, NOW())',
        [adminEmail, hashedPassword, 'admin']
      );
      console.log('✅ Demo admin user created:', adminEmail, '/ password:', adminPassword);
    } else {
      console.log('ℹ️  Demo admin user already exists:', adminEmail);
      // Update with new secure password
      const hashedPassword = await hashPassword(adminPassword, 12);
      await pool.query(
        'UPDATE users SET password = $1, password_changed_at = NOW() WHERE email = $2',
        [hashedPassword, adminEmail]
      );
      console.log('✅ Demo admin password updated:', adminEmail, '/ new password:', adminPassword);
    }
    
    // Create demo regular user with secure password
    const userEmail = 'user@example.com';
    
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [userEmail]);
    
    if (existingUser.rows.length === 0) {
      const hashedPassword = await hashPassword(userPassword, 12);
      await pool.query(
        'INSERT INTO users (email, password, role, created_at) VALUES ($1, $2, $3, NOW())',
        [userEmail, hashedPassword, 'user']
      );
      console.log('✅ Demo regular user created:', userEmail, '/ password:', userPassword);
    } else {
      console.log('ℹ️  Demo regular user already exists:', userEmail);
      // Update with new secure password
      const hashedPassword = await hashPassword(userPassword, 12);
      await pool.query(
        'UPDATE users SET password = $1, password_changed_at = NOW() WHERE email = $2',
        [hashedPassword, userEmail]
      );
      console.log('✅ Demo user password updated:', userEmail, '/ new password:', userPassword);
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('🔐 SECURE Demo accounts created:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                     SECURE CREDENTIALS                      │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log(`│ Admin: ${adminEmail.padEnd(30)} │`);
    console.log(`│ Pass:  ${adminPassword.padEnd(30)} │`);
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log(`│ User:  ${userEmail.padEnd(30)} │`);
    console.log(`│ Pass:  ${userPassword.padEnd(30)} │`);
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   • Passwords are cryptographically secure (16+ characters)');
    console.log('   • Passwords include uppercase, lowercase, numbers, and symbols');
    console.log('   • Passwords are hashed with bcrypt (12 rounds)');
    console.log('   • Change these credentials in production!');
    console.log('   • Store credentials securely');
    console.log('');
    console.log('🛡️  Security features now active:');
    console.log('   • Enhanced password validation');
    console.log('   • Login rate limiting');
    console.log('   • Session management');
    console.log('   • Input sanitization');
    console.log('   • Security headers');
    console.log('   • CSRF protection');
    console.log('');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
