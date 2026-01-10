const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PeerLearn Platform...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js detected: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm detected: ${npmVersion}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

console.log('\n📦 Installing dependencies...');

// Install root dependencies
try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
try {
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
try {
  console.log('Installing frontend dependencies...');
  execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Check if environment files exist
const backendEnvPath = path.join('backend', '.env');
const frontendEnvPath = path.join('frontend', '.env');

if (!fs.existsSync(backendEnvPath)) {
  console.log('⚠️  Backend .env file not found. Creating demo configuration...');
  fs.copyFileSync('.env.example', backendEnvPath);
}

if (!fs.existsSync(frontendEnvPath)) {
  console.log('⚠️  Frontend .env file not found. Creating demo configuration...');
  const frontendEnv = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Demo Firebase Configuration - Replace with real config
REACT_APP_FIREBASE_API_KEY=demo-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=demo-project
REACT_APP_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=demo-app-id`;
  
  fs.writeFileSync(frontendEnv, frontendEnv);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Set up Firebase project (optional for demo)');
console.log('2. Update .env files with your Firebase configuration');
console.log('3. Run the platform:');
console.log('   npm run dev');
console.log('\n🌐 The platform will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('\n📖 For detailed setup instructions, see README.md');