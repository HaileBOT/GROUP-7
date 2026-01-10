const axios = require('axios');

async function updateMentorSkills() {
  try {
    console.log('🔧 Updating mentor skills...');
    
    // Login as mentor
    const mentorLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mentor.test@aau.edu.et',
      password: 'password123'
    });
    
    const mentorToken = mentorLogin.data.token;
    console.log('✅ Mentor logged in');
    
    // Update mentor profile with skills
    const updateResponse = await axios.put('http://localhost:5000/api/matching/mentors/profile', {
      skills: ['JavaScript', 'React', 'Node.js', 'Async Programming', 'Web Development'],
      bio: 'Experienced JavaScript developer with expertise in modern web technologies and asynchronous programming. Passionate about teaching and helping students understand complex concepts.'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor skills updated successfully');
    console.log('   Skills:', updateResponse.data.mentor.skills);
    console.log('   Bio updated:', updateResponse.data.mentor.bio ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Failed to update mentor skills:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

updateMentorSkills();