const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, query } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const updatePassword = async () => {
  try {
    await initializeDatabase();

    const email = 'student@aau.edu.et';
    const newPassword = '@Student';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [passwordHash, email]
    );

    console.log(`Password for ${email} updated to '${newPassword}'`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
};

updatePassword();
