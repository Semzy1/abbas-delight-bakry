#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍰 Abba\'s Delight Backend Setup');
console.log('================================\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  try {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please edit .env file with your email configuration.\n');
  } catch (error) {
    console.log('❌ Failed to create .env file:', error.message);
    console.log('📝 Please manually copy env.example to .env and configure it.\n');
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    console.log('Please run: npm install\n');
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

console.log('🚀 Starting Abba\'s Delight Backend Server...');
console.log('=============================================\n');

// Start the server
try {
  require('./server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure all dependencies are installed: npm install');
  console.log('2. Check your .env configuration');
  console.log('3. Ensure port 3000 is available');
  console.log('4. Check the server logs above for specific errors');
}
