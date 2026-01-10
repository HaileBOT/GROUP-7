require('dotenv').config();
const { initializeDatabase } = require('./src/config/database');
const { initializeDatabase: initSchema } = require('./src/utils/initDatabase');

const testNeonConnection = async () => {
  try {
    console.log('🧪 Testing Neon PostgreSQL connection...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env file');
      console.log('📝 Please add your Neon database URL to backend/.env:');
      console.log('DATABASE_URL=postgresql://username:password@host/database?sslmode=require');
      return;
    }

    // Test database connection
    await initializeDatabase();
    
    // Initialize schema
    await initSchema();
    
    console.log('✅ Neon PostgreSQL connection successful!');
    console.log('🎉 Ready to start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Make sure your DATABASE_URL is correct in backend/.env');
  }
  
  process.exit(0);
};

testNeonConnection();