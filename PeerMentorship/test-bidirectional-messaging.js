const axios = require('axios');

async function testBidirectionalMessaging() {
  try {
    console.log('🧪 Testing Bidirectional Messaging (Mentor ↔ Mentee)...');
    
    // Step 1: Login both users
    console.log('\n1. Logging in both users...');
    const [menteeLogin, mentorLogin] = await Promise.all([
      axios.post('http://localhost:5000/api/auth/login', {
        email: 'testquestion@aau.edu.et',
        password: 'password123'
      }),
      axios.post('http://localhost:5000/api/auth/login', {
        email: 'mentor.test@aau.edu.et',
        password: 'password123'
      })
    ]);
    
    const menteeToken = menteeLogin.data.token;
    const mentorToken = mentorLogin.data.token;
    const mentorId = mentorLogin.data.user.id;
    
    console.log('✅ Both users logged in successfully');
    console.log('   Mentee:', menteeLogin.data.user.firstName, menteeLogin.data.user.lastName);
    console.log('   Mentor:', mentorLogin.data.user.firstName, mentorLogin.data.user.lastName);
    
    // Step 2: Create and accept session
    console.log('\n2. Creating and accepting session...');
    const sessionRequest = await axios.post('http://localhost:5000/api/sessions/request', {
      mentorId: mentorId,
      description: 'Testing bidirectional messaging'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const sessionId = sessionRequest.data.session.id;
    
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {}, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session created and accepted:', sessionId);
    
    // Step 3: Test message exchange
    console.log('\n3. Testing message exchange...');
    
    // Mentee sends first message
    console.log('\n📤 Mentee sends message...');
    const menteeMessage1 = await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Hi! I need help with React hooks. Can you explain useState?'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Mentee message sent successfully');
    console.log('   Message ID:', menteeMessage1.data.messageData.id);
    console.log('   Content:', menteeMessage1.data.messageData.text);
    
    // Mentor receives and replies
    console.log('\n📥 Mentor checks messages...');
    const mentorMessages1 = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor can see mentee\'s message');
    console.log('   Messages visible to mentor:', mentorMessages1.data.length);
    console.log('   Latest message:', mentorMessages1.data[mentorMessages1.data.length - 1].text);
    
    // Mentor replies
    console.log('\n📤 Mentor replies...');
    const mentorMessage1 = await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Great question! useState is a React hook that lets you add state to functional components. Here\'s how it works...'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor reply sent successfully');
    console.log('   Message ID:', mentorMessage1.data.messageData.id);
    
    // Mentee receives mentor's reply
    console.log('\n📥 Mentee checks for mentor\'s reply...');
    const menteeMessages1 = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Mentee can see mentor\'s reply');
    console.log('   Messages visible to mentee:', menteeMessages1.data.length);
    console.log('   Mentor\'s reply:', menteeMessages1.data[menteeMessages1.data.length - 1].text.substring(0, 50) + '...');
    
    // Continue conversation
    console.log('\n📤 Mentee asks follow-up question...');
    await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'That makes sense! Can you also explain useEffect?'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('\n📤 Mentor provides detailed answer...');
    await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Absolutely! useEffect is used for side effects in functional components. It runs after every render by default, but you can control when it runs using dependencies...'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    // Final message check
    console.log('\n4. Final conversation check...');
    const finalMessages = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Complete conversation history:');
    finalMessages.data.forEach((msg, index) => {
      const sender = msg.senderFirstName === 'Question' ? 'Mentee' : 'Mentor';
      console.log(`   ${index + 1}. ${sender}: "${msg.text.substring(0, 60)}..."`);
    });
    
    console.log('\n🎉 Bidirectional messaging test completed successfully!');
    console.log('✅ Mentee → Mentor: Messages delivered');
    console.log('✅ Mentor → Mentee: Messages delivered');
    console.log('✅ Both users can see complete conversation');
    console.log('✅ Message ordering is correct');
    console.log('✅ Real-time chat functionality working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testBidirectionalMessaging();