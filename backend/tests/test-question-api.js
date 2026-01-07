const axios = require('axios');

async function testQuestionAPI() {
  try {
    console.log('🧪 Testing Question API...');
    
    // Step 1: Register a new user
    console.log('1. Registering new user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'testquestion@aau.edu.et',
      password: 'password123',
      firstName: 'Question',
      lastName: 'Tester'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully');
    
    // Step 2: Test question posting
    console.log('2. Posting a test question...');
    const questionResponse = await axios.post('http://localhost:5000/api/questions', {
      title: 'How to use React hooks effectively?',
      description: 'I am learning React and want to understand the best practices for using hooks like useState and useEffect. Can someone provide examples?',
      tags: ['React', 'JavaScript', 'Hooks', 'Frontend'],
      priority: 'medium'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Question posted successfully!');
    console.log('Question ID:', questionResponse.data.question.id);
    console.log('Question Title:', questionResponse.data.question.title);
    
    // Step 3: Test getting questions
    console.log('3. Fetching questions...');
    const getQuestionsResponse = await axios.get('http://localhost:5000/api/questions');
    console.log('✅ Questions fetched successfully!');
    console.log('Total questions:', getQuestionsResponse.data.length);
    
    // Step 4: Test mentor matching
    console.log('4. Testing mentor matching...');
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
    
    console.log('🎉 All tests passed! Question API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testQuestionAPI();