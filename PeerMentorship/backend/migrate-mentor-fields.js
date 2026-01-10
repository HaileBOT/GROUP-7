require('dotenv').config();
const { initializeDatabase, query } = require('./src/config/database');

async function migrate() {
  try {
    console.log('🔧 Starting database migration...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Add new columns for mentor functionality
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}'
    `);
    
    console.log('✅ Added mentor fields to users table');
    
    // Create some sample mentor data
    const sampleMentors = [
      {
        email: 'mentor1@aau.edu.et',
        firstName: 'John',
        lastName: 'Smith',
        skills: ['JavaScript', 'React', 'Node.js', 'Web Development'],
        bio: 'Full-stack developer with 5+ years of experience. Passionate about teaching modern web technologies.'
      },
      {
        email: 'mentor2@aau.edu.et', 
        firstName: 'Sarah',
        lastName: 'Johnson',
        skills: ['Python', 'Data Science', 'Machine Learning', 'Statistics'],
        bio: 'Data scientist specializing in machine learning and statistical analysis. Love helping students with data projects.'
      },
      {
        email: 'mentor3@aau.edu.et',
        firstName: 'Michael',
        lastName: 'Chen',
        skills: ['Java', 'Spring Boot', 'Database Design', 'System Architecture'],
        bio: 'Senior software engineer with expertise in enterprise applications and system design.'
      }
    ];
    
    // Check if sample mentors exist and update them
    for (const mentor of sampleMentors) {
      const existingUsers = await query(
        'SELECT id FROM users WHERE email = $1',
        [mentor.email]
      );
      
      if (existingUsers.length > 0) {
        await query(`
          UPDATE users 
          SET skills = $1, bio = $2, role = 'mentor', approved = true
          WHERE email = $3
        `, [mentor.skills, mentor.bio, mentor.email]);
        
        console.log(`✅ Updated mentor: ${mentor.firstName} ${mentor.lastName}`);
      } else {
        console.log(`ℹ️  Mentor ${mentor.email} not found, skipping...`);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

migrate();