require('dotenv').config();
const { initializeDatabase, query } = require('./backend/src/config/database');

async function addMentorSkills() {
  try {
    console.log('🔧 Adding skills to existing mentors...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Get all mentors
    const mentors = await query(`
      SELECT id, first_name, last_name, email, skills 
      FROM users 
      WHERE role = 'mentor'
    `);
    
    console.log(`Found ${mentors.length} mentors`);
    
    if (mentors.length > 0) {
      // Update the first mentor with some skills
      const mentor = mentors[0];
      const skills = ['React', 'JavaScript', 'Node.js', 'Web Development', 'Frontend'];
      const bio = 'Experienced software developer specializing in modern web technologies. Passionate about helping students learn React and JavaScript.';
      
      await query(`
        UPDATE users 
        SET skills = $1, bio = $2, approved = true
        WHERE id = $3
      `, [skills, bio, mentor.id]);
      
      console.log(`✅ Updated mentor: ${mentor.first_name} ${mentor.last_name}`);
      console.log(`   Skills: ${skills.join(', ')}`);
      console.log(`   Bio: ${bio}`);
    }
    
    // Add a few more sample mentors if needed
    const sampleMentors = [
      {
        email: 'mentor.python@aau.edu.et',
        firstName: 'Sarah',
        lastName: 'Johnson',
        password: 'password123',
        skills: ['Python', 'Data Science', 'Machine Learning', 'Statistics'],
        bio: 'Data scientist with 5+ years of experience in machine learning and statistical analysis.'
      },
      {
        email: 'mentor.java@aau.edu.et',
        firstName: 'Michael',
        lastName: 'Chen',
        password: 'password123',
        skills: ['Java', 'Spring Boot', 'Database Design', 'System Architecture'],
        bio: 'Senior software engineer specializing in enterprise Java applications and system design.'
      }
    ];
    
    for (const mentor of sampleMentors) {
      // Check if mentor already exists
      const existing = await query('SELECT id FROM users WHERE email = $1', [mentor.email]);
      
      if (existing.length === 0) {
        // Create new mentor
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(mentor.password, 10);
        
        await query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role, skills, bio, approved, email_verified)
          VALUES ($1, $2, $3, $4, 'mentor', $5, $6, true, true)
        `, [mentor.email, hashedPassword, mentor.firstName, mentor.lastName, mentor.skills, mentor.bio]);
        
        console.log(`✅ Created new mentor: ${mentor.firstName} ${mentor.lastName}`);
      } else {
        console.log(`ℹ️  Mentor ${mentor.email} already exists`);
      }
    }
    
    console.log('🎉 Mentor skills update completed!');
    
  } catch (error) {
    console.error('❌ Failed to add mentor skills:', error);
  }
  
  process.exit(0);
}

addMentorSkills();