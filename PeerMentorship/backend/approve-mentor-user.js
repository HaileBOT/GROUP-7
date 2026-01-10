const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { initializeDatabase, query } = require('./src/config/database');

const approveMentor = async () => {
  try {
    await initializeDatabase();

    const email = 'mentor@aau.edu.et';
    
    console.log(`Approving mentor with email: ${email}...`);

    const result = await query(
      `UPDATE users 
       SET approved = true 
       WHERE email = $1 
       RETURNING id, email, first_name, last_name, role, approved`,
      [email]
    );

    if (result.length > 0) {
      console.log('✅ Mentor approved successfully:');
      console.log(result[0]);
    } else {
      console.log(`❌ No user found with email: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error approving mentor:', error);
    process.exit(1);
  }
};

approveMentor();
