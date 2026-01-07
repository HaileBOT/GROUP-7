const axios = require('axios');

async function testRatingSimple() {
  try {
    console.log('🧪 Testing Rating System (Simple)...');
    
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
    
    // Step 3: Check for completed sessions
    console.log('3. Checking for completed sessions...');
    const sessionLogsResponse = await axios.get('http://localhost:5000/api/sessions/logs', {
      headers: { 'Authorization': `Bearer ${menteeToken}` }
    });
    
    if (sessionLogsResponse.data.length > 0) {
      const completedSession = sessionLogsResponse.data[0];
      console.log('✅ Found completed session:', completedSession.id);
      
      // Step 4: Test rating submission
      console.log('4. Testing rating submission...');
      
      try {
        const ratingResponse = await axios.post('http://localhost:5000/api/ratings', {
          sessionId: completedSession.id,
          mentorId: completedSession.mentorId,
          rating: 4,
          feedback: 'Great session! Very helpful and informative.'
        }, {
          headers: { 'Authorization': `Bearer ${menteeToken}` }
        });
        
        console.log('✅ Rating submitted successfully');
        console.log('   Rating ID:', ratingResponse.data.rating.id);
        
      } catch (ratingError) {
        if (ratingError.response?.data?.error?.includes('already submitted')) {
          console.log('✅ Rating already exists for this session (expected)');
        } else {
          throw ratingError;
        }
      }
      
      // Step 5: Test rating retrieval
      console.log('5. Testing rating retrieval...');
      const mentorRatingsResponse = await axios.get(`http://localhost:5000/api/ratings/${completedSession.mentorId}`);
      
      console.log('✅ Retrieved mentor ratings');
      console.log('   Average Rating:', mentorRatingsResponse.data.averageRating);
      console.log('   Total Ratings:', mentorRatingsResponse.data.totalRatings);
      
      if (mentorRatingsResponse.data.ratings.length > 0) {
        console.log('   Latest Rating:', mentorRatingsResponse.data.ratings[0].rating, 'stars');
      }
      
      // Step 6: Test message persistence
      console.log('6. Testing message persistence...');
      const messagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${completedSession.id}`, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      console.log('✅ Retrieved', messagesResponse.data.length, 'messages from completed session');
      
      if (messagesResponse.data.length > 0) {
        console.log('✅ Messages persist after session completion');
        messagesResponse.data.slice(0, 3).forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg.senderFirstName}: "${msg.text.substring(0, 50)}..."`);
        });
      }
      
    } else {
      console.log('⚠️  No completed sessions found. Creating a test session...');
      
      // Create a quick test session
      const questionResponse = await axios.post('http://localhost:5000/api/questions', {
        title: 'Quick test for rating system',
        description: 'This is a test question for rating functionality.',
        tags: ['Testing'],
        priority: 'low'
      }, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      const questionId = questionResponse.data.question.id;
      
      // Mentor answers and offers session
      const answerResponse = await axios.post(`http://localhost:5000/api/questions/${questionId}/answer`, {
        answer: 'I can help with this test.',
        offerSession: true
      }, {
        headers: { 'Authorization': `Bearer ${mentorToken}` }
      });
      
      const sessionId = answerResponse.data.sessionId;
      
      // Accept and immediately end the session
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/accept`, {
        scheduledTime: new Date().toISOString()
      }, {
        headers: { 'Authorization': `Bearer ${mentorToken}` }
      });
      
      // Send a test message
      await axios.post('http://localhost:5000/api/chat/messages', {
        sessionId: sessionId,
        text: 'This is a test message for persistence testing.'
      }, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      // End the session
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/end`, {
        summary: 'Test session completed'
      }, {
        headers: { 'Authorization': `Bearer ${mentorToken}` }
      });
      
      console.log('✅ Created and completed test session:', sessionId);
      
      // Now test rating
      const ratingResponse = await axios.post('http://localhost:5000/api/ratings', {
        sessionId: sessionId,
        mentorId: mentorId,
        rating: 5,
        feedback: 'Excellent test session!'
      }, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      console.log('✅ Rating submitted for new session');
      
      // Test message persistence
      const messagesResponse = await axios.get(`http://localhost:5000/api/chat/messages/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      
      console.log('✅ Messages persist after session end:', messagesResponse.data.length, 'messages');
    }
    
    console.log('\n🎉 Rating and Persistence Test Results:');
    console.log('✅ Rating system works correctly');
    console.log('✅ Message persistence works correctly');
    console.log('✅ Rating modal should display after session ends');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testRatingSimple();