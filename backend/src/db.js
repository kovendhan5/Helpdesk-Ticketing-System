import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'helpdesk_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'helpdesk_local_password_2024',
  ssl: false, // Explicitly disable SSL for local development
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

console.log('🔗 Database configuration:', {
  ...dbConfig,
  password: '***hidden***'
});

const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);    // Create tickets table with enhanced features
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL REFERENCES users(email),
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
        category TEXT CHECK (category IN ('general', 'technical', 'billing', 'account', 'feature_request', 'bug_report')) DEFAULT 'general',
        assigned_to TEXT REFERENCES users(email),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL
      )
    `);

    // Create ticket comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_email TEXT NOT NULL REFERENCES users(email),
        comment TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#6B7280',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default categories
    await pool.query(`
      INSERT INTO categories (name, description, color) VALUES
        ('General', 'General inquiries and requests', '#6B7280'),
        ('Technical', 'Technical support and IT issues', '#DC2626'),
        ('Billing', 'Billing and payment related issues', '#059669'),
        ('Account', 'Account management and access issues', '#7C3AED'),
        ('Feature Request', 'New feature suggestions', '#2563EB'),
        ('Bug Report', 'Software bugs and issues', '#EA580C')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
