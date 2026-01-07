const axios = require('axios');

async function testMentorQuestions() {
  try {
    console.log('🧪 Testing Mentor Question Matching...');
    
    // Step 1: Login as a mentee and create a question
    console.log('1. Logging in as mentee...');
    const menteeLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testquestion@aau.edu.et',
      password: 'password123'
    });
    
    const menteeToken = menteeLogin.data.token;
    console.log('✅ Mentee login successful');
    
    // Step 2: Create a question with React/JavaScript tags
    console.log('2. Creating a question with React/JavaScript tags...');
    const questionResponse = await axios.post('http://localhost:5000/api/questions', {
      title: 'How to optimize React component performance?',
      description: 'I have a React component that re-renders too often. How can I optimize it using React.memo and useMemo?',
      tags: ['React', 'JavaScript', 'Performance', 'Frontend'],
      priority: 'medium'
    }, {
      headers: {
        'Authorization': `Bearer ${menteeToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Question created successfully!');
    console.log('Question ID:', questionResponse.data.question.id);
    
    // Step 3: Get the mentor ID (we know there's one with React skills)
    console.log('3. Getting mentor with React skills...');
    const mentorsResponse = await axios.get('http://localhost:5000/api/matching/mentors/all');
    const reactMentor = mentorsResponse.data.mentors.find(m => 
      m.skills && m.skills.includes('React')
    );
    
    if (!reactMentor) {
      console.log('❌ No mentor with React skills found');
      return;
    }
    
    console.log('✅ Found React mentor:', reactMentor.first_name, reactMentor.last_name);
    console.log('Mentor skills:', reactMentor.skills);
    
    // Step 4: Test the new mentor questions endpoint
    console.log('4. Testing mentor-specific questions endpoint...');
    const mentorQuestionsResponse = await axios.get(`http://localhost:5000/api/questions/for-mentor/${reactMentor.id}`);
    
    console.log('✅ Mentor questions fetched successfully!');
    console.log('Relevant questions found:', mentorQuestionsResponse.data.length);
    
    if (mentorQuestionsResponse.data.length > 0) {
      mentorQuestionsResponse.data.forEach((question, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log('  Title:', question.title);
        console.log('  Tags:', question.tags);
        console.log('  Tag matches:', question.tagMatches);
        console.log('  Relevance score:', question.relevanceScore + '%');
        console.log('  Priority:', question.priority);
      });
    }
    
    // Step 5: Test with a question that doesn't match
    console.log('\n5. Creating a question with non-matching tags...');
    const nonMatchingQuestion = await axios.post('http://localhost:5000/api/questions', {
      title: 'How to solve calculus derivatives?',
      description: 'I need help with finding derivatives of complex functions.',
      tags: ['Mathematics', 'Calculus', 'Derivatives'],
      priority: 'high'
    }, {
      headers: {
        'Authorization': `Bearer ${menteeToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Non-matching question created');
    
    // Step 6: Check if mentor still gets only relevant questions
    console.log('6. Checking if mentor gets only relevant questions...');
    const updatedMentorQuestions = await axios.get(`http://localhost:5000/api/questions/for-mentor/${reactMentor.id}`);
    
    console.log('Total questions for mentor:', updatedMentorQuestions.data.length);
    const hasMatchingTags = updatedMentorQuestions.data.every(q => 
      q.tags.some(tag => reactMentor.skills.includes(tag))
    );
    
    if (hasMatchingTags) {
      console.log('✅ All questions match mentor skills!');
    } else {
      console.log('❌ Some questions don\'t match mentor skills');
    }
    
    console.log('🎉 All mentor question matching tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMentorQuestions();