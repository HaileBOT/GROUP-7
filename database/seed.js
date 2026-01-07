require('dotenv').config();
const { seedData } = require('./src/utils/seedData');

seedData().then(() => {
  console.log('Seeding completed');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});