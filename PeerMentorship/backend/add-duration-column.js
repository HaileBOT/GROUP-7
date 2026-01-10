const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, query } = require('./src/config/database');

const addDurationColumn = async () => {
  try {
    await initializeDatabase();
    
    await query(`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 45;
    `);
    
    console.log('✅ Added duration column to sessions table with default 45 minutes');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding duration column:', error);
    process.exit(1);
  }
};

addDurationColumn();
