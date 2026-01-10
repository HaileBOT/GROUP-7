const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, query } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const checkUser = async () => {
  try {
    await initializeDatabase();

    const email = 'student@aau.edu.et';
    const users = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (users.length === 0) {
      console.log(`User ${email} not found.`);
    } else {
      console.log(`User ${email} found.`);
      const user = users[0];
      console.log('User details:', { ...user, password_hash: 'HIDDEN' });
      
      // Check 'password123'
      const isMatchDefault = await bcrypt.compare('password123', user.password_hash);
      console.log(`Password 'password123' match: ${isMatchDefault}`);

      // Check '@Student'
      const isMatchUser = await bcrypt.compare('@Student', user.password_hash);
      console.log(`Password '@Student' match: ${isMatchUser}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
};

checkUser();
