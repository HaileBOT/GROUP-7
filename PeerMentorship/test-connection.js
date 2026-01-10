const axios = require('axios');

const API_URL = 'http://localhost:5001/api/health';

console.log('Testing connection to:', API_URL);

axios.get(API_URL)
  .then(response => {
    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  })
  .catch(error => {
    console.error('❌ Connection failed!');
    if (error.response) {
      console.error('Server responded with status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might be down or unreachable.');
      console.error('Error code:', error.code);
    } else {
      console.error('Error setting up request:', error.message);
    }
  });
