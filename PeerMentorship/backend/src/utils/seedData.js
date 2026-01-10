const { db } = require('../config/firebase');

const seedData = async () => {
  try {
    console.log('Seeding demo data...');

    // Sample courses
    const courses = [
      {
        name: 'React & Next.js Mastery',
        department: 'Computer Science',
        description: 'Learn modern React development with Next.js framework',
        tags: ['React', 'Next.js', 'JavaScript', 'Frontend']
      },
      {
        name: 'Python for Data Science',
        department: 'Data Science',
        description: 'Master Python programming for data analysis and machine learning',
        tags: ['Python', 'Data Analysis', 'Machine Learning', 'Pandas']
      },
      {
        name: 'UI/UX Design Fundamentals',
        department: 'Design',
        description: 'Learn user interface and user experience design principles',
        tags: ['UI Design', 'UX Design', 'Figma', 'Prototyping']
      },
      {
        name: 'Cybersecurity Essentials',
        department: 'Computer Science',
        description: 'Introduction to cybersecurity concepts and practices',
        tags: ['Security', 'Networking', 'Ethical Hacking', 'Cryptography']
      }
    ];

    // Add courses to database
    for (const course of courses) {
      await db.collection('courses').add({
        ...course,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = { seedData };