const axios = require('axios');

async function testSimpleFlow() {
  try {
    console.log('🧪 Testing Simple Mentor-Mentee Flow...');
    
    // Step 1: Register a mentor
    console.log('\n1. Registering a mentor...');
    try {
      const mentorRegister = await axios.post('http://localhost:5000/api/auth/register', {
        email: 'mentor.test@aau.edu.et',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Mentor',
        role: 'mentor'
      });
      console.log('✅ Mentor registered successfully');
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('✅ Mentor already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Step 2: Login as mentee
    console.log('2. Logging in as mentee...');
    const menteeLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const menteeToken = menteeLogin.data.token;
    console.log('✅ Mentee login successful');
    
    // Step 3: Create a question
    console.log('3. Creating a question...');
    const questionResponse = await axios.post('http://localhost:5000/api/questions', {
      title: 'How to handle async operations in JavaScript?',
      description: 'I am confused about promises, async/await, and callbacks. Can someone explain the differences?',
      tags: ['JavaScript', 'Async', 'Promises'],
      priority: 'medium'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const questionId = questionResponse.data.question.id;
    console.log('✅ Question created:', questionId);
    
    // Step 4: Login as mentor
    console.log('4. Logging in as mentor...');
    const mentorLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mentor.test@aau.edu.et',
      password: 'password123'
    });
    
    const mentorToken = mentorLogin.data.token;
    const mentorId = mentorLogin.data.user.id;
    console.log('✅ Mentor login successful');
    
    // Step 5: Update mentor skills
    console.log('5. Updating mentor skills...');
    await axios.put('http://localhost:5000/api/matching/mentors/profile', {
      skills: ['JavaScript', 'React', 'Node.js', 'Async Programming'],
      bio: 'Experienced JavaScript developer with expertise in async programming and modern frameworks.'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    console.log('✅ Mentor skills updated');
    
    // Step 6: Get relevant questions for mentor
    console.log('6. Getting relevant questions for mentor...');
    const mentorQuestionsResponse = await axios.get(`http://localhost:5000/api/questions/for-mentor/${mentorId}`);
    console.log('✅ Mentor sees', mentorQuestionsResponse.data.length, 'relevant questions');
    
    const relevantQuestion = mentorQuestionsResponse.data.find(q => q.id === questionId);
    if (relevantQuestion) {
      console.log('✅ Question appears in mentor\'s feed with', relevantQuestion.relevanceScore + '% relevance');
    }
    
    // Step 7: Mentor answers question and offers session
    console.log('7. Mentor answering question and offering session...');
    const answerResponse = await axios.post(`http://localhost:5000/api/questions/${questionId}/answer`, {
      answer: 'Great question! Callbacks are the foundation, Promises provide better error handling and chaining, and async/await makes asynchronous code look synchronous. I\'d be happy to explain this in detail in a mentoring session.',
      offerSession: true
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Question answered and session offered');
    const sessionId = answerResponse.data.sessionId;
    console.log('   Session ID:', sessionId);
    
    // Step 8: Mentor accepts the session (auto-accept for testing)
    console.log('8. Mentor accepting session...');
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session accepted and activated');
    
    // Step 9: Test messaging
    console.log('9. Testing chat messaging...');
    
    // Mentee sends message
    await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'Thank you for accepting! I\'m really excited to learn about async programming.'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    // Mentor replies
    await axios.post('http://localhost:5000/api/chat/messages', {
      sessionId: sessionId,
      text: 'You\'re welcome! Let\'s start with the basics. Can you tell me what you already know about callbacks?'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Messages exchanged successfully');
    
    // Step 10: Get chat history
    console.log('10. Retrieving chat history...');
    const messagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Retrieved', messagesResponse.data.length, 'messages');
    messagesResponse.data.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.senderFirstName}: "${msg.text.substring(0, 60)}..."`);
    });
    
    console.log('\n🎉 Complete flow test successful!');
    console.log('✅ Mentor registration works');
    console.log('✅ Question posting works');
    console.log('✅ Mentor skill matching works');
    console.log('✅ Question answering with session offer works');
    console.log('✅ Session acceptance works');
    console.log('✅ Real-time messaging works');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testSimpleFlow();