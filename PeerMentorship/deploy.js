#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PeerLearn Deployment Script\n');

// Check if we're in the right directory
if (!fs.existsSync('frontend') || !fs.existsSync('backend')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

console.log('📋 Pre-deployment checklist:');
console.log('✅ Frontend and backend directories found');

// Check if package.json files exist
if (!fs.existsSync('frontend/package.json')) {
  console.error('❌ Frontend package.json not found');
  process.exit(1);
}

if (!fs.existsSync('backend/package.json')) {
  console.error('❌ Backend package.json not found');
  process.exit(1);
}

console.log('✅ Package.json files found');

// Check if vercel.json exists
if (!fs.existsSync('vercel.json')) {
  console.error('❌ vercel.json not found. Please create it first.');
  process.exit(1);
}

console.log('✅ Vercel configuration found');

// Check git status
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  You have uncommitted changes:');
    console.log(gitStatus);
    console.log('📝 Committing changes...');
    
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "prepare for deployment"', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('⚠️  Git not initialized or no changes to commit');
}

// Push to GitHub
try {
  console.log('📤 Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Code pushed to GitHub');
} catch (error) {
  console.log('⚠️  Failed to push to GitHub. Please push manually.');
}

console.log('\n🎯 Next Steps:');
console.log('1. Go to https://vercel.com');
console.log('2. Import your GitHub repository: hiruy72/FSE-project');
console.log('3. Set Root Directory to: frontend');
console.log('4. Add environment variables (see DEPLOYMENT.md)');
console.log('5. Deploy!');

console.log('\n📚 For detailed instructions, see DEPLOYMENT.md');
console.log('🎉 Happy deploying!');