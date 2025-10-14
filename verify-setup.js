#!/usr/bin/env node

/**
 * Startup Verification Script
 * Checks all prerequisites before starting the server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 BookReaderAgent Startup Verification\n');

let errors = [];
let warnings = [];

// Check 1: .env file
console.log('1️⃣  Checking .env file...');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file exists');
  const envContent = fs.readFileSync('.env', 'utf-8');
  
  const requiredVars = [
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_PROJECT_ID',
    'PORT',
    'TTS_OUTPUT_DIR'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName} is configured`);
    } else {
      errors.push(`${varName} missing in .env`);
    }
  });
  
  if (!envContent.includes('GEMINI_API_KEY') || envContent.includes('# GEMINI_API_KEY')) {
    warnings.push('GEMINI_API_KEY not set (AI Q&A feature will not work)');
  }
} else {
  errors.push('.env file not found - you need to create it!');
}

// Check 2: Google credentials file
console.log('\n2️⃣  Checking Google Cloud credentials...');
const credsFiles = [
  'docsreader-464020-fbc0af2aa3c5.json',
  './docsreader-464020-fbc0af2aa3c5.json',
  'credentials.json',
  './credentials.json'
];

let foundCreds = false;
for (const file of credsFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ Credentials file found: ${file}`);
    foundCreds = true;
    break;
  }
}

if (!foundCreds) {
  errors.push('Google Cloud credentials file not found');
}

// Check 3: Audio directory
console.log('\n3️⃣  Checking audio output directory...');
if (fs.existsSync('./audio')) {
  console.log('   ✅ Audio directory exists');
  const audioContents = fs.readdirSync('./audio');
  console.log(`   📁 Contains ${audioContents.length} items`);
} else {
  console.log('   ⚠️  Audio directory will be created on first use');
}

// Check 4: FFmpeg
console.log('\n4️⃣  Checking FFmpeg installation...');
try {
  const ffmpegPath = execSync('which ffmpeg', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ FFmpeg installed at: ${ffmpegPath}`);
  const ffmpegVersion = execSync('ffmpeg -version 2>&1 | head -n1', { encoding: 'utf-8' }).trim();
  console.log(`   📦 ${ffmpegVersion}`);
} catch (e) {
  errors.push('FFmpeg not installed (needed for large chapters)');
  console.log('   ❌ FFmpeg not found');
  console.log('   💡 Install with: brew install ffmpeg');
}

// Check 5: Node modules
console.log('\n5️⃣  Checking dependencies...');
if (fs.existsSync('./node_modules')) {
  console.log('   ✅ node_modules directory exists');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
  console.log(`   📦 ${depCount} dependencies + ${devDepCount} dev dependencies`);
} else {
  errors.push('node_modules not found - run: npm install');
}

// Check 6: Compiled code
console.log('\n6️⃣  Checking compiled code...');
if (fs.existsSync('./dist/server.js')) {
  console.log('   ✅ Compiled code exists (dist/server.js)');
  const stats = fs.statSync('./dist/server.js');
  console.log(`   📅 Last compiled: ${stats.mtime.toLocaleString()}`);
} else {
  warnings.push('dist/server.js not found - run: npm run build');
}

// Check 7: Port availability
console.log('\n7️⃣  Checking port availability...');
const net = require('net');
const PORT = 3000;
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    warnings.push(`Port ${PORT} is already in use - change PORT in .env or stop the other process`);
    console.log(`   ⚠️  Port ${PORT} is already in use`);
  }
  server.close();
});

server.once('listening', () => {
  console.log(`   ✅ Port ${PORT} is available`);
  server.close();
});

server.listen(PORT);

// Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Your server is ready to start.');
    console.log('\n🚀 Start the server with:');
    console.log('   npm start           (production)');
    console.log('   npm run dev         (development)');
    console.log('   npm run dev:watch   (with auto-reload)');
  } else {
    if (errors.length > 0) {
      console.log('❌ ERRORS - Fix these before starting:');
      errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS - Server may start but with limited functionality:');
      warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
    }
  }
  
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(errors.length > 0 ? 1 : 0);
}, 500);


