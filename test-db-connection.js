// Database connection test script
import pkg from 'pg';
const { Pool } = pkg;

// Test database connection with exact same config as backend
const dbConfig = {
  host: 'localhost', // Using localhost since we're testing from host
  port: 5432,
  database: 'helpdesk_db',
  user: 'postgres',
  password: 'helpdesk_local_password_2024',
  ssl: false,
  connectionTimeoutMillis: 5000,
};

console.log('Testing database connection with config:', {
  ...dbConfig,
  password: '***hidden***'
});

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version);
    
    client.release();
    await pool.end();
    
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
