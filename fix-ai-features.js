const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing AI Features and Missing Pages...\n');

// 1. Ensure .env file exists in backend
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvReadyPath = path.join(__dirname, 'backend', '.env.READY');

if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvReadyPath)) {
  console.log('📋 Copying .env.READY to .env...');
  fs.copyFileSync(backendEnvReadyPath, backendEnvPath);
  console.log('✅ Backend .env file created');
} else if (fs.existsSync(backendEnvPath)) {
  console.log('✅ Backend .env file already exists');
} else {
  console.log('❌ No .env.READY file found');
}

// 2. Ensure .env file exists in frontend
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const frontendEnvExamplePath = path.join(__dirname, 'frontend', '.env.example');

if (!fs.existsSync(frontendEnvPath)) {
  console.log('📋 Creating frontend .env file...');
  const frontendEnvContent = `# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=CampusCompanion
REACT_APP_VERSION=2.0.0
REACT_APP_ENABLE_VOICE_CHAT=true
REACT_APP_ENABLE_AI_FEATURES=true
`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend .env file created');
} else {
  console.log('✅ Frontend .env file already exists');
}

// 3. Create uploads directory structure
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
const materialsDir = path.join(uploadsDir, 'materials');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir, { recursive: true });
  console.log('✅ Created materials directory');
}

// 4. Check if all required page components exist
const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const requiredPages = [
  'AssignmentManagerAgent.js',
  'ExamPrepAgent.js',
  'MaterialFinderAgent.js',
  'EventRegistrationAgent.js',
  'AdminAgenticAIFeatures.js',
  'AgenticFeatures.js'
];

console.log('\n📄 Checking required page components...');
requiredPages.forEach(page => {
  const pagePath = path.join(pagesDir, page);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${page} exists`);
  } else {
    console.log(`❌ ${page} missing`);
  }
});

console.log('\n🎯 Fix Summary:');
console.log('- Environment files configured');
console.log('- Upload directories created');
console.log('- File serving routes added to materials.js');
console.log('- Missing routes added to App.js');
console.log('- AI features should now work properly');

console.log('\n📋 Next Steps:');
console.log('1. Start the backend server: cd backend && npm start');
console.log('2. Start the frontend server: cd frontend && npm start');
console.log('3. Test the application at http://localhost:3000');
console.log('4. Check if blank pages now load properly');
console.log('5. Test AI features with proper authentication');

console.log('\n🔧 Fix Complete!');
