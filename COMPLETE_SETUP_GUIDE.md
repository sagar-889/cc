# 🚀 Complete Project Setup Guide
## Everything You Need to Run CampusCompanion

---

## 📋 TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Project](#running-the-project)
7. [Testing All Features](#testing-all-features)
8. [Troubleshooting](#troubleshooting)

---

## 1️⃣ PREREQUISITES

### Required Software

1. **Node.js** (v14.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (v6.0.0 or higher)
   - Comes with Node.js
   - Verify: `npm --version`

3. **MongoDB Atlas Account** (Free Tier)
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create cluster (M0 Free tier)

4. **Google Gemini API Key** (Free)
   - Get key: https://makersuite.google.com/app/apikey
   - Click "Create API Key"

5. **OpenAI API Key** (Optional - for voice TTS)
   - Get key: https://platform.openai.com/api-keys
   - Requires billing setup

6. **Code Editor**
   - VS Code (recommended)
   - Any text editor

---

## 2️⃣ MONGODB SETUP

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google

### Step 2: Create Cluster
1. Choose "FREE" M0 tier
2. Select cloud provider (AWS recommended)
3. Choose region closest to you
4. Click "Create Cluster"
5. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `campusadmin`
4. Password: `Niharika1234` (or create your own)
5. Select "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Address
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your password
6. Example: `mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion`

---

## 3️⃣ BACKEND SETUP

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

**Installs**:
- express, mongoose, jsonwebtoken, bcryptjs
- multer, dotenv, cors, helmet, morgan
- express-rate-limit, express-validator
- @google/generative-ai, openai, langchain
- axios, pdf-parse

### Step 3: Create .env File
```bash
# Copy the ready template
cp .env.READY .env

# Or create manually
touch .env
```

### Step 4: Configure .env
```env
# Database
MONGODB_URI=mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=campus-companion-super-secret-key-2025-niharika-project-xyz789
JWT_EXPIRES_IN=7d

# AI Keys
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Replace `your-gemini-api-key-here` with your actual Gemini API key!

### Step 5: Create Upload Directories
```bash
mkdir -p uploads/materials
mkdir -p uploads/profiles
mkdir -p uploads/assignments
```

### Step 6: Seed Database (Optional)
```bash
# Seed initial data (courses, faculty, events)
node scripts/seed.js

# Create admin user
node scripts/create-admin.js
```

---

## 4️⃣ FRONTEND SETUP

### Step 1: Navigate to Frontend Folder
```bash
cd ../frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

**Installs**:
- react, react-dom, react-router-dom
- axios, zustand, react-hot-toast
- tailwindcss, lucide-react
- recharts, jspdf, leaflet, react-leaflet
- date-fns, react-syntax-highlighter

### Step 3: Create .env File
```bash
touch .env
```

### Step 4: Configure .env
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 5️⃣ ENVIRONMENT CONFIGURATION

### Backend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | Secret key for JWT tokens | Random long string |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `GEMINI_API_KEY` | Google Gemini Pro API key | Get from Google AI Studio |
| `OPENAI_API_KEY` | OpenAI API key (optional) | Get from OpenAI |
| `MAX_FILE_SIZE` | Max upload file size in bytes | `5242880` (5MB) |
| `UPLOAD_DIR` | Upload directory path | `./uploads` |

### Frontend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## 6️⃣ RUNNING THE PROJECT

### Method 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend**:
```bash
cd backend
npm start
# Or for auto-restart on changes:
npm run dev
```

**Output**:
```
✅ MongoDB connected successfully
✅ Enhanced Agentic AI Core initialized successfully
✅ Agents initialized
✅ Intelligent Chatbot AI initialized
✅ Loaded route: auth
✅ Loaded route: courses
✅ Loaded route: materials
✅ Loaded route: chatbot
✅ Loaded route: voiceChat
✅ Loaded route: agenticAI
✅ Loaded route: agenticFeatures
🚀 Server running on port 5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

**Output**:
```
Compiled successfully!

You can now view campus-companion-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

### Method 2: Production Build

**Backend** (remains same):
```bash
cd backend
npm start
```

**Frontend** (build and serve):
```bash
cd frontend
npm run build
# Serve the build folder with a static server
npx serve -s build -l 3000
```

---

## 7️⃣ TESTING ALL FEATURES

### 1. Test Backend Health
```bash
# Open browser or use curl
curl http://localhost:5000/health
# Should return: { "success": true, "message": "Server is running" }
```

### 2. Test User Registration
```javascript
// Using browser console or Postman
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Student',
    email: 'test@student.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    year: 2
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 3. Test Login
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@student.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Token:', data.token);
  localStorage.setItem('token', data.token);
});
```

### 4. Test Chatbot
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/chatbot/intelligent-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Hello, how are you?'
  })
})
.then(res => res.json())
.then(data => console.log(data.response));
```

### 5. Test File Upload
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Test Material');
formData.append('description', 'Testing upload');
formData.append('category', 'notes');

fetch('http://localhost:5000/api/materials/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### 6. Test Agentic AI - Schedule Generator
```javascript
fetch('http://localhost:5000/api/agenticFeatures/assignments/manage', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data.schedule));
```

### 7. Test Voice Assistant
```javascript
fetch('http://localhost:5000/api/voiceChat/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Test voice command'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 8️⃣ TROUBLESHOOTING

### Issue: MongoDB Connection Failed

**Error**: `MongoServerError: bad auth`

**Solution**:
1. Check username/password in connection string
2. Ensure database user is created in Atlas
3. Verify IP address is whitelisted
4. Check if password contains special characters (URL encode if needed)

---

### Issue: Server Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

---

### Issue: CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
1. Check `FRONTEND_URL` in backend .env
2. Ensure CORS middleware is configured:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
```

---

### Issue: AI Not Working

**Error**: `Using fallback responses`

**Solution**:
1. Check `GEMINI_API_KEY` in .env
2. Verify API key is valid (test at Google AI Studio)
3. Check API quota/limits
4. Ensure no firewall blocking Google APIs

---

### Issue: File Upload Failed

**Error**: `File type not allowed` or `Upload directory not found`

**Solution**:
1. Create upload directories:
```bash
mkdir -p backend/uploads/materials
mkdir -p backend/uploads/profiles
mkdir -p backend/uploads/assignments
```

2. Check file type is allowed in `middleware/upload.js`:
```javascript
const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.png'];
```

3. Check file size (default: 5MB max)

---

### Issue: JWT Token Invalid

**Error**: `Invalid token` or `Token expired`

**Solution**:
1. Clear localStorage and login again
2. Check `JWT_SECRET` matches in backend
3. Verify token expiration time
4. Ensure Authorization header format: `Bearer <token>`

---

### Issue: Frontend Not Loading API Data

**Error**: `Network Error` or `Failed to fetch`

**Solution**:
1. Ensure backend is running on port 5000
2. Check `REACT_APP_API_URL` in frontend .env
3. Verify axios baseURL configuration
4. Check browser console for errors
5. Test API directly in browser: `http://localhost:5000/health`

---

### Issue: Voice Assistant Not Working

**Error**: `speechSynthesis is not defined`

**Solution**:
1. Voice features require HTTPS or localhost
2. Check browser compatibility (Chrome/Edge recommended)
3. Grant microphone permission when prompted
4. For production, use HTTPS with SSL certificate

---

## 📊 PORT CONFIGURATION

| Service | Default Port | Can Change |
|---------|--------------|------------|
| Backend API | 5000 | Yes (in .env) |
| Frontend Dev | 3000 | Yes (prompt) |
| MongoDB | 27017 | No (Atlas manages) |

---

## 🔐 DEFAULT CREDENTIALS

**After running `create-admin.js`**:
- Email: `admin@campus.com`
- Password: `Admin@123`

**Test Student** (after registration):
- Email: Your registered email
- Password: Your chosen password

---

## ✅ CHECKLIST

Before starting development:
- [ ] Node.js installed (v14+)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] Gemini API key obtained
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Dependencies installed (backend)
- [ ] Dependencies installed (frontend)
- [ ] Upload directories created
- [ ] Database seeded (optional)
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register/login successfully
- [ ] Chatbot responds
- [ ] File upload works

---

## 🚀 DEPLOYMENT (Production)

### Backend Deployment (Heroku Example)
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create campus-companion-api

# Set environment variables
heroku config:set MONGODB_URI="your-connection-string"
heroku config:set JWT_SECRET="your-secret"
heroku config:set GEMINI_API_KEY="your-key"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify Example)
```bash
# Build
npm run build

# Deploy with Netlify CLI
netlify deploy --prod --dir=build

# Or drag & drop build folder to Netlify website
```

---

## 📱 ACCESS THE APPLICATION

**Development**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api

**Production** (after deployment):
- Frontend: https://your-app.netlify.app
- Backend API: https://your-api.herokuapp.com

---

## 🎉 YOU'RE ALL SET!

Your CampusCompanion is now fully configured and ready to use!

**Next Steps**:
1. Register a student account
2. Explore the dashboard
3. Try the chatbot
4. Upload study materials
5. Generate study schedules
6. Test voice commands
7. Use Agentic AI features

**Need Help?** Check:
- API_ENDPOINTS_GUIDE.md
- AGENTIC_AI_COMPLETE_GUIDE.md
- PACKAGES_DETAILED_GUIDE.md
- PROJECT_COMPLETE_OVERVIEW.md

**Happy Coding! 🚀**
