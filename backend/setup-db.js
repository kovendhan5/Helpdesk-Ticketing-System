import pool from './src/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Create tables (this is also done in db.js, but explicit here)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL REFERENCES users(email),
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
        status TEXT CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables created');
    
    // Create demo admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, 'admin']
      );
      console.log('✅ Demo admin user created:', adminEmail, '/ password:', adminPassword);
    } else {
      console.log('ℹ️  Demo admin user already exists:', adminEmail);
    }
    
    // Create demo regular user
    const userEmail = 'user@example.com';
    const userPassword = 'user123';
    
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [userEmail]);
    
    if (existingUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [userEmail, hashedPassword, 'user']
      );
      console.log('✅ Demo regular user created:', userEmail, '/ password:', userPassword);
    } else {
      console.log('ℹ️  Demo regular user already exists:', userEmail);
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Demo accounts:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User:  user@example.com / user123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
