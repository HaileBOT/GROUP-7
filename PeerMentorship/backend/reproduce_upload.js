const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const run = async () => {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'student@aau.edu.et',
      password: '@Student'
    });
    const { token, user } = loginRes.data;
    console.log('Logged in as:', user.id);

    // 2. Create dummy file
    const form = new FormData();
    form.append('photo', Buffer.from('fake image content'), {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });

    // 3. Upload
    console.log('Uploading photo...');
    const uploadRes = await axios.post(`http://localhost:5001/api/users/${user.id}/photo`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log('Upload success:', uploadRes.data);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

run();
