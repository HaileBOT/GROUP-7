require('dotenv').config({ path: './backend/.env' });
const { query, initializeDatabase } = require('./src/config/database');

async function debug() {
  try {
    await initializeDatabase();

    console.log('--- Users ---');
    const users = await query("SELECT id, first_name, last_name, email, role, profile FROM users");
    console.log(JSON.stringify(users, null, 2));

    console.log('\n--- Courses ---');
    const courses = await query("SELECT id, name FROM courses");
    console.log(JSON.stringify(courses, null, 2));

    console.log('\n--- Testing Matching Query ---');
    const mentorId = 'd8021c83-cbb7-434c-bdf5-9a07f3043cbd';
    const mentorCourses = [
        "9171b936-91a5-420d-8cd7-433041c65e30",
        "e74afcdb-b552-46e1-b250-d6a44ac8b300"
    ];

    console.log('Mentor Courses:', mentorCourses);

    const matchingQuestions = await query(`
      SELECT 
        q.id,
        q.title,
        q.course_id,
        q.status
      FROM questions q
      WHERE q.status = 'open'
        AND q.course_id = ANY($1::uuid[])
    `, [mentorCourses]);

    console.log('Matching Questions:', JSON.stringify(matchingQuestions, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

debug();
