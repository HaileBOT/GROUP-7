require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, initializeDatabase, closeConnection } = require('./src/config/database');

async function createAdmin() {
  try {
    await initializeDatabase();

    const email = 'admin@aau.edu.et';
    const password = '@Admin';
    const firstName = 'System';
    const lastName = 'Admin';

    // Check if user exists
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      console.log('Admin user already exists. Updating role and password...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      await query(
        'UPDATE users SET password_hash = $1, role = $2, approved = true WHERE email = $3',
        [hash, 'admin', email]
      );
      console.log('Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, approved, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [email, hash, firstName, lastName, 'admin', true, true]
      );
      console.log('Admin user created successfully.');
    }

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await closeConnection();
  }
}

createAdmin();
