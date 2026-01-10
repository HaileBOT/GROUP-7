const axios = require('axios');
const { generateToken } = require('./src/middlewares/jwtAuth');
const { query, initializeDatabase } = require('./src/config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const testStudentsEndpoint = async () => {
  try {
    await initializeDatabase();

    // Get a user ID to generate a token
    const users = await query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('No users found to test with');
      return;
    }
    
    const userId = users[0].id;
    const token = generateToken(userId);
    
    console.log('Testing /api/students endpoint...');
    
    try {
      const response = await axios.get('http://localhost:5001/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Success! Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Request failed:', error.message);
      if (error.code) console.error('Error code:', error.code);
      if (error.cause) console.error('Error cause:', error.cause);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Test script error:', error);
  }
};

testStudentsEndpoint();
