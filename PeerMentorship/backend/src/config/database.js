// const { Pool } = require('pg');
const { Pool } = require('@neondatabase/serverless');
// const { neon } = require('@neondatabase/serverless');

// Database connection
let db;
let pool;

const initializeDatabase = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    console.log('✅ Connecting to Neon PostgreSQL...');
    
    // Use Neon serverless driver for better reliability
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1 as test');
    client.release();
    
    console.log('🔥 Neon PostgreSQL connection successful');
    
    return { pool };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Query helper function
const query = async (text, params = []) => {
  try {
    if (!pool) {
      throw new Error('Database not initialized');
    }
    
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Close connection
const closeConnection = async () => {
  if (pool) {
    await pool.end();
    console.log('Database connection closed');
  }
};

module.exports = {
  initializeDatabase,
  query,
  transaction,
  closeConnection,
  getPool: () => pool
};