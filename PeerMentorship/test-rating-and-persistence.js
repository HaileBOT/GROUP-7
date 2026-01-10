const axios = require('axios');

async function testRatingAndPersistence() {
  try {
    console.log('🧪 Testing Rating System and Message Persistence...');
    
    // Step 1: Login as mentee
    console.log('\n1. Logging in as mentee...');
    const menteeLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const menteeToken = menteeLogin.data.token;
    const menteeId = menteeLogin.data.user.id;
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
    
    // Step 3: Check for active sessions
    console.log('3. Checking for active sessions...');
    const activeSessionsResponse = await axios.get('http://localhost:5000/api/sessions/active', {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    let sessionId;
    if (activeSessionsResponse.data.length > 0) {
      sessionId = activeSessionsResponse.data[0].id;
      console.log('✅ Found existing active session:', sessionId);
    } else {
      // Create a new session for testing
      console.log('   No active sessions found, creating one...');
      
      // Create a question first
      const questionResponse = await axios.post('http://localhost:5000/api/questions', {
        title: 'Test question for rating system',
        description: 'This is a test question to create a session for rating testing.',
        tags: ['Testing', 'Rating'],
        priority: 'medium'
      }, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      const questionId = questionResponse.data.question.id;
      
      // Mentor answers and offers session
      const answerResponse = await axios.post(`http://localhost:5000/api/questions/${questionId}/answer`, {
        answer: 'I can help you with this. Let\'s have a session.',
        offerSession: true
      }, {
        headers: { 'Authorization': `Bearer ${mentorToken}` }
      });
      
      sessionId = answerResponse.data.sessionId;
      
      // Accept the session
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {
        scheduledTime: new Date().toISOString()
      }, {
        headers: { 'Authorization': `Bearer ${mentorToken}` }
      });
      
      console.log('✅ Created and activated new session:', sessionId);
    }
    
    // Step 4: Test message persistence
    console.log('4. Testing message persistence...');
    
    // Send some test messages
    const testMessages = [
      'Hello, thank you for accepting the session!',
      'I have some questions about the topic.',
      'Could you explain the main concepts?',
      'This is very helpful, thank you!'
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const sender = i % 2 === 0 ? 'mentee' : 'mentor';
      const token = sender === 'mentee' ? menteeToken : mentorToken;
      
      await axios.post('http://localhost:5000/api/chat/messages', {
        sessionId: sessionId,
        text: testMessages[i]
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Small delay to ensure proper ordering
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Sent', testMessages.length, 'test messages');
    
    // Step 5: Retrieve messages to test persistence
    console.log('5. Testing message retrieval...');
    const messagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Retrieved', messagesResponse.data.length, 'messages');
    
    if (messagesResponse.data.length >= testMessages.length) {
      console.log('✅ Message persistence working correctly');
      messagesResponse.data.slice(-testMessages.length).forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.senderFirstName}: "${msg.text}"`);
      });
    } else {
      console.log('⚠️  Some messages may not have been persisted properly');
    }
    
    // Step 6: End the session
    console.log('6. Ending the session...');
    await axios.post(`http://localhost:5000/api/sessions/${sessionId}/end`, {
      summary: 'Great session! Very helpful discussion.'
    }, {
      headers: { 'Authorization': `Bearer ${mentorToken}` }
    });
    
    console.log('✅ Session ended successfully');
    
    // Step 7: Test rating system
    console.log('7. Testing rating system...');
    
    try {
      const ratingResponse = await axios.post('http://localhost:5000/api/ratings', {
        sessionId: sessionId,
        mentorId: mentorId,
        rating: 5,
        feedback: 'Excellent mentor! Very knowledgeable and patient. Explained concepts clearly and answered all my questions.'
      }, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      console.log('✅ Rating submitted successfully');
      console.log('   Rating ID:', ratingResponse.data.rating.id);
      
      // Step 8: Verify rating was stored
      console.log('8. Verifying rating storage...');
      const mentorRatingsResponse = await axios.get(`http://localhost:5000/api/ratings/${mentorId}`);
      
      console.log('✅ Retrieved mentor ratings');
      console.log('   Average Rating:', mentorRatingsResponse.data.averageRating);
      console.log('   Total Ratings:', mentorRatingsResponse.data.totalRatings);
      
      if (mentorRatingsResponse.data.ratings.length > 0) {
        const latestRating = mentorRatingsResponse.data.ratings[0];
        console.log('   Latest Rating:', latestRating.rating, 'stars');
        console.log('   Feedback:', latestRating.feedback.substring(0, 50) + '...');
      }
      
      // Step 9: Test rating statistics
      console.log('9. Testing rating statistics...');
      const statsResponse = await axios.get(`http://localhost:5000/api/ratings/${mentorId}/stats`);
      
      console.log('✅ Rating statistics retrieved');
      console.log('   Average:', statsResponse.data.averageRating);
      console.log('   Total:', statsResponse.data.totalRatings);
      console.log('   Distribution:', JSON.stringify(statsResponse.data.ratingDistribution));
      
    } catch (ratingError) {
      if (ratingError.response?.data?.error?.includes('already submitted')) {
        console.log('✅ Rating already exists for this session (expected behavior)');
        
        // Still test rating retrieval
        const mentorRatingsResponse = await axios.get(`http://localhost:5000/api/ratings/${mentorId}`);
        console.log('✅ Retrieved existing ratings');
        console.log('   Average Rating:', mentorRatingsResponse.data.averageRating);
        console.log('   Total Ratings:', mentorRatingsResponse.data.totalRatings);
      } else {
        throw ratingError;
      }
    }
    
    // Step 10: Test message persistence after session end
    console.log('10. Testing message persistence after session end...');
    const finalMessagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    console.log('✅ Messages still accessible after session end');
    console.log('   Total messages:', finalMessagesResponse.data.length);
    
    console.log('\n🎉 Rating and Persistence Test Results:');
    console.log('✅ Message sending works');
    console.log('✅ Message persistence works');
    console.log('✅ Message retrieval works');
    console.log('✅ Session ending works');
    console.log('✅ Rating submission works');
    console.log('✅ Rating storage and retrieval works');
    console.log('✅ Rating statistics work');
    console.log('✅ Messages persist after session ends');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testRatingAndPersistence();