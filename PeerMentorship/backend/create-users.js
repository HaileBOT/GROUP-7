const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, query } = require('./src/config/database');

const createUsers = async () => {
  try {
    await initializeDatabase();

    const saltRounds = 12;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create Mentor
    const mentorEmail = 'mentor@aau.edu.et';
    const mentorExists = await query('SELECT * FROM users WHERE email = $1', [mentorEmail]);
    
    if (mentorExists.length === 0) {
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, approved, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [mentorEmail, passwordHash, 'John', 'Doe', 'mentor', true, true]
      );
      console.log(`✅ Mentor created: ${mentorEmail} / ${password}`);
    } else {
      console.log(`ℹ️ Mentor already exists: ${mentorEmail}`);
    }

    // Create Mentee
    const menteeEmail = 'student@aau.edu.et';
    const menteeExists = await query('SELECT * FROM users WHERE email = $1', [menteeEmail]);

    if (menteeExists.length === 0) {
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, approved, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [menteeEmail, passwordHash, 'Jane', 'Smith', 'mentee', true, true]
      );
      console.log(`✅ Mentee created: ${menteeEmail} / ${password}`);
    } else {
      console.log(`ℹ️ Mentee already exists: ${menteeEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
};

createUsers();
