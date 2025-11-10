# CampusCompanion

A comprehensive campus management system with AI-powered features for students and administrators.

## 🚀 Deployment on Vercel

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Environment Variables Required

Before deploying, set these environment variables in your Vercel project settings:

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

**Important**: Replace `your-backend-url.com` with your actual backend server URL.

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add vercel.json .vercelignore
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Configure Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Framework Preset: **Other** (already configured in vercel.json)
   - Root Directory: Leave as default (`.`)
   - Build settings will be auto-detected from vercel.json

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `REACT_APP_API_URL` with your backend URL
   - Click "Save"

4. **Deploy**
   - Vercel will automatically deploy
   - Wait for build to complete

### What's Configured

The `vercel.json` file configures:
- **Build Command**: Installs and builds from `frontend` directory
- **Output Directory**: Points to `frontend/build`
- **Rewrites**: SPA routing support
- **Cache Headers**: Optimized static asset caching

### Backend Deployment

**Note**: This Vercel deployment is for the **frontend only**. 

Your backend needs to be deployed separately on:
- Railway
- Render
- Heroku
- DigitalOcean
- AWS
- Or any Node.js hosting platform

Then update the `REACT_APP_API_URL` environment variable in Vercel with your backend URL.

### Local Development

```bash
# Backend
cd backend
npm install
node server.js

# Frontend
cd frontend
npm install
npm start
```

### Features

- 🎓 Course Management
- 📅 Timetable System
- 📚 Study Materials
- 🎯 Event Management
- 💬 Intelligent Chatbot
- 🤖 AI-Powered Features
- 📊 Admin Dashboard
- 🗺️ Campus Navigation
- 🆘 Helpdesk System

## Tech Stack

**Frontend**: React, TailwindCSS, Axios, React Router  
**Backend**: Node.js, Express, MongoDB, Mongoose  
**AI**: Google Gemini API

## License

MIT
