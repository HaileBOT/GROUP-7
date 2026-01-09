const axios = require('axios');

async function testMentorMatching() {
  try {
    console.log('🧪 Testing Mentor Matching...');
    
    // Test 1: Get all mentors
    console.log('1. Getting all mentors...');
    const allMentorsResponse = await axios.get('http://localhost:5000/api/matching/mentors/all');
    console.log('✅ All mentors fetched successfully!');
    console.log('Total mentors:', allMentorsResponse.data.mentors.length);
    
    if (allMentorsResponse.data.mentors.length > 0) {
      const mentor = allMentorsResponse.data.mentors[0];
      console.log('Sample mentor:', {
        name: `${mentor.first_name} ${mentor.last_name}`,
        skills: mentor.skills,
        bio: mentor.bio,
        rating: mentor.averageRating
      });
    }
    
    // Test 2: Login with existing user to test matching
    console.log('2. Logging in with existing user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 3: Test mentor matching with tags
    console.log('3. Testing mentor matching with React tags...');
    const matchingResponse = await axios.post('http://localhost:5000/api/matching/mentors', {
      tags: ['React', 'JavaScript']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Mentor matching working!');
    console.log('Found mentors:', matchingResponse.data.mentors.length);
    
    if (matchingResponse.data.mentors.length > 0) {
      matchingResponse.data.mentors.forEach((mentor, index) => {
        console.log(`Mentor ${index + 1}:`, {
          name: `${mentor.first_name} ${mentor.last_name}`,
          matchScore: mentor.matchScore,
          skills: mentor.skills,
          skillMatches: mentor.skillMatches
        });
      });
    }
    
    console.log('🎉 All mentor matching tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMentorMatching();