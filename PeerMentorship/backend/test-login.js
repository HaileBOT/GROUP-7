const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@aau.edu.et',
      password: 'password123' // Assuming this user exists or we'll get 401, but NOT Network Error
    });
    console.log('✅ Login Success:', response.status);
  } catch (error) {
    if (error.response) {
      console.log('✅ Server responded (even if error):', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
      console.error(error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

testLogin();
