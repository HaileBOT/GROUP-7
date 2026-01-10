const http = require('http');

const mentorId = 'd8021c83-cbb7-434c-bdf5-9a07f3043cbd'; // mentor haile
const options = {
  hostname: 'localhost',
  port: 5001,
  path: `/api/questions/for-mentor/${mentorId}`,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
      
      if (Array.isArray(json) && json.length > 0) {
        console.log('SUCCESS: API returned questions!');
      } else {
        console.log('FAILURE: API returned empty list or error.');
        console.log('This likely means the server is running the OLD code (checking skills instead of courses).');
        console.log('Please RESTART the backend server.');
      }
    } catch (e) {
      console.log('Error parsing JSON:', e);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
