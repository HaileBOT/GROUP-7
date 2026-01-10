const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testRegisterMentor() {
  try {
    const email = `mentor.test.${Date.now()}@aau.edu.et`;
    console.log('Registering new mentor:', email);

    const res = await axios.post(`${API_URL}/auth/register`, {
      email: email,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Mentor',
      role: 'mentor'
    });

    console.log('Registration response:', res.data);

  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
  }
}

testRegisterMentor();
