const axios = require('axios');

async function testMentorAPI() {
  try {
    console.log('Testing mentor API...');
    
    // Test get all mentors
    const response = await axios.get('http://localhost:5000/api/matching/mentors/all');
    console.log('✅ Get all mentors successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test with filters
    const filteredResponse = await axios.get('http://localhost:5000/api/matching/mentors/all?sortBy=rating&limit=10');
    console.log('✅ Filtered mentors successful');
    console.log('Filtered mentors count:', filteredResponse.data.mentors.length);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testMentorAPI();