const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Mentor-Mentee Flow...');
    
    // Step 1: Login as mentee
    console.log('\n1. Logging in as mentee...');
    const menteeLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const menteeToken = menteeLogin.data.token;
    const menteeId = menteeLogin.data.user.id;
    console.log('✅ Mentee login successful');
    
    // Step 2: Create a question
    console.log('2. Creating a question...');
    const questionResponse = await axios.post('http://localhost:5000/api/questions', {
      title: 'Need help with React state management',
      description: 'I am struggling with managing complex state in React. Should I use Context API or Redux?',
      tags: ['React', 'JavaScript', 'State Management'],
      priority: 'medium'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const questionId = questionResponse.data.question.id;
    console.log('✅ Question created:', questionId);
    
    // Step 3: Get mentor with React skills
    console.log('3. Finding React mentor...');
    const mentorsResponse = await axios.get('http://localhost:5000/api/matching/mentors/all');
    const reactMentor = mentorsResponse.data.mentors.find(m => 
      m.skills && m.skills.includes('React')
    );
    
    if (!reactMentor) {
      console.log('❌ No React mentor found');
      return;
    }
    
    console.log('✅ Found mentor:', reactMentor.first_name, reactMentor.last_name);
    
    // Step 4: Login as mentor
    console.log('4. Logging in as mentor...');
    const mentorLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hiruy.ugr-1838-16@aau.edu.et', // Assuming this is the mentor's email
      password: 'password123'
    });
    
    const mentorToken = mentorLogin.data.token;
    console.log('✅ Mentor login successful');
    
    // Step 5: Get questions for mentor
    console.log('5. Getting relevant questions for mentor...');
    const mentorQuestionsResponse = await axios.get(`http://localhost:5000/api/questions/for-mentor/${reactMentor.id}`);
    console.log('✅ Mentor sees', mentorQuestionsResponse.data.length, 'relevant questions');
    
    const relevantQuestion = mentorQuestionsResponse.data.find(q => q.id === questionId);
    if (relevantQuestion) {
      console.log('✅ Question appears in mentor\'s relevant questions');
      console.log('   Relevance score:', relevantQuestion.relevanceScore + '%');
    }
    
    // Step 6: Mentor answers question and offers session
    console.log('6. Mentor answering question and offering session...');
    const answerResponse = await axios.post(`http://localhost:5000/api/questions/${questionId}/answer`, {
      answer: 'For complex state management in React, I recommend starting with Context API for simpler cases and Redux for more complex applications. I can help you understand both approaches in a mentoring session.',
      offerSession: true
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Question answered and session offered');
    const sessionId = answerResponse.data.sessionId;
    console.log('   Session ID:', sessionId);
    
    // Step 7: Check pending sessions for mentor
    console.log('7. Checking pending sessions for mentor...');
    const pendingSessionsResponse = await axios.get('http://localhost:5000/api/sessions/pending', {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor has', pendingSessionsResponse.data.length, 'pending sessions');
    
    // Step 8: Mentor accepts the session
    console.log('8. Mentor accepting session...');
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session accepted and activated');
    
    // Step 9: Check active sessions for both users
    console.log('9. Checking active sessions...');
    const menteeActiveResponse = await axios.get('http://localhost:5000/api/sessions/active', {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const mentorActiveResponse = await axios.get('http://localhost:5000/api/sessions/active', {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentee has', menteeActiveResponse.data.length, 'active sessions');
    console.log('✅ Mentor has', mentorActiveResponse.data.length, 'active sessions');
    
    // Step 10: Test messaging
    console.log('10. Testing messaging...');
    
    // Mentee sends first message
    const message1Response = await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Hi! Thank you for accepting my session request. I\'m excited to learn about state management.'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Mentee sent message');
    
    // Mentor replies
    const message2Response = await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Hello! I\'m happy to help. Let\'s start by discussing your current project and what kind of state you need to manage.'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Mentor replied');
    
    // Step 11: Get messages
    console.log('11. Getting chat messages...');
    const messagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Retrieved', messagesResponse.data.length, 'messages');
    messagesResponse.data.forEach((msg, index) => {
      console.log(`   Message ${index + 1}: ${msg.senderFirstName} - "${msg.text.substring(0, 50)}..."`);
    });
    
    console.log('\n🎉 Complete flow test successful!');
    console.log('✅ Question posting works');
    console.log('✅ Mentor matching works');
    console.log('✅ Question answering works');
    console.log('✅ Session creation works');
    console.log('✅ Session acceptance works');
    console.log('✅ Messaging works');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    console.error('Full error:', error);
  }
}

testCompleteFlow();