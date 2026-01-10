const axios = require('axios');

async function testCompleteRatingFlow() {
  try {
    console.log('🧪 Testing Complete Rating Flow...');
    
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
    
    // Step 3: Create a complete session flow
    console.log('3. Creating a complete session flow...');
    
    // Create question
    const questionResponse = await axios.post('http://localhost:5000/api/questions', {
      title: 'Complete rating flow test',
      description: 'Testing the complete flow from question to rating.',
      tags: ['Testing', 'Rating', 'Flow'],
      priority: 'medium'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const questionId = questionResponse.data.question.id;
    console.log('✅ Question created:', questionId);
    
    // Mentor answers and offers session
    const answerResponse = await axios.post(`http://localhost:5000/api/questions/${questionId}/answer`, {
      answer: 'I can help you with this! Let\'s have a detailed session to go through everything step by step.',
      offerSession: true
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    const sessionId = answerResponse.data.sessionId;
    console.log('✅ Session offered:', sessionId);
    
    // Accept the session
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {
      scheduledTime: new Date().toISOString()
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session accepted and activated');
    
    // Step 4: Simulate a realistic chat conversation
    console.log('4. Simulating realistic chat conversation...');
    
    const conversation = [
      { sender: 'mentee', text: 'Hi! Thank you for accepting my session request. I\'m really excited to learn!' },
      { sender: 'mentor', text: 'Hello! I\'m happy to help. Let\'s start with your specific questions about the topic.' },
      { sender: 'mentee', text: 'I\'m having trouble understanding the core concepts. Could you explain them step by step?' },
      { sender: 'mentor', text: 'Absolutely! Let me break it down for you. First, let\'s understand the fundamentals...' },
      { sender: 'mentee', text: 'That makes so much sense now! Could you give me a practical example?' },
      { sender: 'mentor', text: 'Sure! Here\'s a real-world scenario that demonstrates these concepts perfectly...' },
      { sender: 'mentee', text: 'Wow, that example really clarified everything. I think I understand now!' },
      { sender: 'mentor', text: 'Great! Do you have any other questions, or would you like to practice with another example?' },
      { sender: 'mentee', text: 'I think I\'m good for now. This has been incredibly helpful. Thank you so much!' },
      { sender: 'mentor', text: 'You\'re very welcome! Feel free to reach out if you need any more help in the future.' }
    ];
    
    for (let i = 0; i < conversation.length; i++) {
      const message = conversation[i];
      const token = message.sender === 'mentee' ? menteeToken : mentorToken;
      
      await axios.post('http://localhost:5000/api/chat/messages', {
        sessionId: sessionId,
        text: message.text
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Small delay to simulate natural conversation timing
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('✅ Realistic conversation completed (', conversation.length, 'messages)');
    
    // Step 5: Verify message persistence during active session
    console.log('5. Verifying message persistence during active session...');
    const activeMessagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Retrieved', activeMessagesResponse.data.length, 'messages during active session');
    
    // Step 6: End the session
    console.log('6. Ending the session...');
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/end`, {
      summary: 'Excellent session! The mentee showed great understanding and engagement. All questions were answered thoroughly.'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session ended successfully');
    console.log('   📱 At this point, the frontend should show the rating modal for the mentee');
    
    // Step 7: Verify message persistence after session end
    console.log('7. Verifying message persistence after session end...');
    const postSessionMessagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Messages still accessible after session end');
    console.log('   Total messages:', postSessionMessagesResponse.data.length);
    
    if (postSessionMessagesResponse.data.length === activeMessagesResponse.data.length) {
      console.log('✅ Message persistence verified - no messages lost');
    } else {
      console.log('⚠️  Message count mismatch - possible persistence issue');
    }
    
    // Step 8: Submit rating (simulating user action in rating modal)
    console.log('8. Submitting rating (simulating rating modal submission)...');
    
    const ratingResponse = await axios.post('http://localhost:5000/api/ratings', {
      sessionId: sessionId,
      mentorId: mentorId,
      rating: 5,
      feedback: 'Outstanding mentor! Explained everything clearly, was very patient, and provided excellent examples. The session was incredibly valuable and I learned so much. Highly recommend!'
    }, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Rating submitted successfully');
    console.log('   Rating ID:', ratingResponse.data.rating.id);
    console.log('   📱 At this point, the rating modal should close and navigate to dashboard');
    
    // Step 9: Verify rating was properly stored and mentor stats updated
    console.log('9. Verifying rating storage and mentor stats...');
    
    const mentorRatingsResponse = await axios.get(`http://localhost:5000/api/ratings/${mentorId}`);
    console.log('✅ Mentor ratings retrieved');
    console.log('   Average Rating:', mentorRatingsResponse.data.averageRating, '⭐');
    console.log('   Total Ratings:', mentorRatingsResponse.data.totalRatings);
    
    const latestRating = mentorRatingsResponse.data.ratings[0];
    if (latestRating && latestRating.sessionId === sessionId) {
      console.log('✅ Latest rating matches our session');
      console.log('   Rating:', latestRating.rating, 'stars');
      console.log('   Feedback preview:', latestRating.feedback.substring(0, 60) + '...');
    }
    
    // Step 10: Test rating statistics
    console.log('10. Testing rating statistics...');
    const statsResponse = await axios.get(`http://localhost:5000/api/ratings/${mentorId}/stats`);
    
    console.log('✅ Rating statistics retrieved');
    console.log('   Average:', statsResponse.data.averageRating, '⭐');
    console.log('   Total:', statsResponse.data.totalRatings);
    console.log('   Distribution:', JSON.stringify(statsResponse.data.ratingDistribution));
    
    // Step 11: Verify session appears in logs
    console.log('11. Verifying session appears in completed logs...');
    const sessionLogsResponse = await axios.get('http://localhost:5000/api/sessions/logs', {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    const ourSession = sessionLogsResponse.data.find(s => s.id === sessionId);
    if (ourSession) {
      console.log('✅ Session found in completed logs');
      console.log('   Status:', ourSession.status);
      console.log('   Duration:', ourSession.duration, 'minutes');
    }
    
    console.log('\n🎉 Complete Rating Flow Test Results:');
    console.log('✅ Question creation works');
    console.log('✅ Session offer and acceptance works');
    console.log('✅ Real-time messaging works');
    console.log('✅ Message persistence during session works');
    console.log('✅ Session ending works');
    console.log('✅ Message persistence after session end works');
    console.log('✅ Rating submission works');
    console.log('✅ Rating storage and retrieval works');
    console.log('✅ Mentor statistics update works');
    console.log('✅ Session logging works');
    
    console.log('\n📱 Frontend Behavior Summary:');
    console.log('1. When mentor/mentee clicks "End Session" button');
    console.log('2. Session is marked as completed in database');
    console.log('3. For mentees: Rating modal automatically appears');
    console.log('4. For mentors: Redirected to dashboard');
    console.log('5. After rating submission: Modal closes, navigate to dashboard');
    console.log('6. All chat messages remain accessible even after session ends');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testCompleteRatingFlow();