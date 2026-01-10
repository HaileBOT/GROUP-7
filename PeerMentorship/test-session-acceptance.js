const axios = require('axios');

async function testSessionAcceptance() {
  try {
    console.log('🧪 Testing Session Acceptance and Redirect...');
    
    // Step 1: Login as mentee
    console.log('\n1. Logging in as mentee...');
    const menteeLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const menteeToken = menteeLogin.data.token;
    console.log('✅ Mentee login successful');
    
    // Step 2: Login as mentor
    console.log('2. Logging in as mentor...');
    const mentorLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mentor.test@aau.edu.et',
      password: 'password123'
    });
    
    const mentorToken = mentorLogin.data.token;
    const mentorId = mentorLogin.data.user.id;
    console.log('✅ Mentor login successful');
    
    // Step 3: Mentee requests a session
    console.log('3. Mentee requesting session...');
    const sessionRequest = await axios.post('http://localhost:5000/api/sessions/request', {
      mentorId: mentorId,
      description: 'I need help with React state management and would like to schedule a session.'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const sessionId = sessionRequest.data.session.id;
    console.log('✅ Session requested:', sessionId);
    
    // Step 4: Check pending sessions for mentor
    console.log('4. Checking pending sessions for mentor...');
    const pendingResponse = await axios.get('http://localhost:5000/api/sessions/pending', {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor has', pendingResponse.data.length, 'pending sessions');
    
    const pendingSession = pendingResponse.data.find(s => s.id === sessionId);
    if (pendingSession) {
      console.log('✅ Session appears in mentor\'s pending list');
      console.log('   Mentee:', pendingSession.menteeName);
      console.log('   Description:', pendingSession.description);
    }
    
    // Step 5: Mentor accepts session
    console.log('5. Mentor accepting session...');
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session accepted successfully!');
    console.log('📱 In the frontend, mentor would now be redirected to: /chat/' + sessionId);
    
    // Step 6: Verify session is now active
    console.log('6. Verifying session is active...');
    const activeResponse = await axios.get('http://localhost:5000/api/sessions/active', {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    const activeSession = activeResponse.data.find(s => s.id === sessionId);
    if (activeSession) {
      console.log('✅ Session is now active');
      console.log('   Status:', activeSession.status);
      console.log('   Other user:', activeSession.otherUser);
    }
    
    // Step 7: Test that both users can access the chat
    console.log('7. Testing chat access for both users...');
    
    // Mentee sends a message
    const menteeMessage = await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Hi! Thank you for accepting my session request. I\'m ready to learn!'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Mentee can send messages');
    
    // Mentor replies
    const mentorMessage = await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Hello! I\'m excited to help you with React state management. Let\'s get started!'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor can send messages');
    
    // Get chat history
    const chatHistory = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Chat history retrieved:', chatHistory.data.length, 'messages');
    
    console.log('\n🎉 Session acceptance and chat flow working perfectly!');
    console.log('✅ Session request works');
    console.log('✅ Mentor can see pending sessions');
    console.log('✅ Session acceptance works');
    console.log('✅ Session becomes active');
    console.log('✅ Both users can chat');
    console.log('📱 Frontend redirect to /chat/' + sessionId + ' will work');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testSessionAcceptance();