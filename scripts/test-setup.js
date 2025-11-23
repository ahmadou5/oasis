#!/usr/bin/env node

/**
 * Test setup script to verify the Stakeit application works correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Stakeit setup verification...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

try {
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
  
  if (parseInt(nodeVersion.slice(1)) < 18) {
    console.error('❌ Node.js 18 or higher is required');
    process.exit(1);
  }

  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Run type check
  console.log('🔍 Running type check...');
  execSync('npm run type-check', { stdio: 'inherit' });

  // Run linter
  console.log('🧹 Running linter...');
  execSync('npm run lint', { stdio: 'inherit' });

  // Test build
  console.log('🏗️  Testing build...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ All checks passed! Your Stakeit application is ready.');
  console.log('\n🎉 Run `npm run dev` to start the development server.');
  console.log('🌐 Open http://localhost:3000 in your browser to see the app.');

} catch (error) {
  console.error('\n❌ Setup verification failed:', error.message);
  process.exit(1);
}