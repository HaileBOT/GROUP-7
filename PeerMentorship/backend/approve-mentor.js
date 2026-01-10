require('dotenv').config();
const { initializeDatabase, query } = require('./src/config/database');

async function approveMentor() {
  try {
    console.log('🔧 Approving mentor...');
    
    await initializeDatabase();
    
    // Approve the test mentor
    await query(`
      UPDATE users 
      SET approved = true, role = 'mentor'
      WHERE email = 'mentor.test@aau.edu.et'
    `);
    
    console.log('✅ Mentor approved successfully');
    
    // Check mentor status
    const mentors = await query(`
      SELECT email, first_name, last_name, role, approved, skills
      FROM users 
      WHERE email = 'mentor.test@aau.edu.et'
    `);
    
    if (mentors.length > 0) {
      const mentor = mentors[0];
      console.log('Mentor details:', {
        email: mentor.email,
        name: `${mentor.first_name} ${mentor.last_name}`,
        role: mentor.role,
        approved: mentor.approved,
        skills: mentor.skills
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to approve mentor:', error);
  }
  
  process.exit(0);
}

approveMentor();