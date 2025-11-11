# CampusCompanion Deployment Guide

## Overview
This guide walks you through deploying CampusCompanion:
- **Frontend**: React app on Vercel (port 3000)
- **Backend**: Node.js API on Render (port 5000)
- **Python AI Service**: FastAPI on Render (port 8000) — *optional, can run separately*
- **Database**: MongoDB Atlas (shared by both Node and Python services)

---

## Prerequisites

1. **GitHub Repository**: ✅ Already pushed to `https://github.com/NiharikaAdigoppula/CampusCompanion`
2. **MongoDB Atlas**: ✅ Already configured
   - Connection String: `mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0`
3. **API Keys**: ✅ Already configured
   - GEMINI_API_KEY: `AIzaSyCM96WJhe2J9IGqOis01srq8jemIGki-qg`
   - JWT_SECRET: `campus-companion-super-secret-key-2025-niharika-project-xyz789`

---

## Part 1: Deploy Backend on Render

### Step 1: Create Render Account
1. Go to **https://render.com**
2. Sign up using GitHub (recommended) or email
3. Connect your GitHub account (if not done during signup)

### Step 2: Create Backend Service
1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository: **CampusCompanion**
3. Fill in the form:
   - **Name**: `campus-companion-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or upgrade for production)

### Step 3: Add Environment Variables
Before deploying, add these variables in Render dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `campus-companion-super-secret-key-2025-niharika-project-xyz789` |
| `GEMINI_API_KEY` | `AIzaSyCM96WJhe2J9IGqOis01srq8jemIGki-qg` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-URL.vercel.app` (set this after Vercel deployment) |

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://campus-companion-backend.onrender.com`
4. **Save this URL** — you'll need it for frontend deployment

### Step 5: Verify Backend is Running
```bash
curl https://campus-companion-backend.onrender.com/api/health
# Expected response: {"status":"ok","message":"CampusCompanion API is running"}
```

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Create Vercel Account
1. Go to **https://vercel.com**
2. Sign up using GitHub (recommended)
3. Connect your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository: **CampusCompanion**
3. Vercel will auto-detect it's a monorepo with `frontend/` directory

### Step 3: Configure Deployment Settings
- **Framework Preset**: `Create React App` (auto-detected)
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `build` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Step 4: Add Environment Variables
Add this variable in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://campus-companion-backend.onrender.com` |

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://campus-companion.vercel.app`

### Step 6: Verify Frontend is Running
1. Visit your Vercel URL in browser
2. Should see CampusCompanion React app loading
3. Login should work (connects to deployed backend)

### Step 7: Update Backend FRONTEND_URL
Now that you have the Vercel URL, go back to Render and update:
- **FRONTEND_URL** = `https://YOUR-VERCEL-URL.vercel.app`

---

## Part 3: Deploy Python AI Service (Optional but Recommended)

### Option A: Deploy on Render (Separate Service)

1. **Go to Render dashboard** → **"New +"** → **"Web Service"**
2. Select your GitHub repository: **CampusCompanion**
3. Fill in the form:
   - **Name**: `campus-companion-python-ai`
   - **Environment**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt` (from `python-ai-service/` directory)
   - **Start Command**: `cd python-ai-service && python main.py`
   - **Instance Type**: `Free` (or upgrade)

4. **Add Environment Variables**:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0` |
| `GEMINI_API_KEY` | `AIzaSyCM96WJhe2J9IGqOis01srq8jemIGki-qg` |
| `PYTHON_AI_PORT` | `8000` |
| `BACKEND_API_KEY` | `your-secure-api-key-here` |

5. Click **"Create Web Service"** and wait for deployment

6. **Update Backend** to point to Python service:
   - In Render, go to backend service environment variables
   - Add: `PYTHON_AI_SERVICE_URL` = `https://campus-companion-python-ai.onrender.com`

---

## Part 4: Verify All Services Are Working Together

### Test 1: Backend Health Check
```bash
curl https://campus-companion-backend.onrender.com/api/health
```
Expected: `{"status":"ok","message":"CampusCompanion API is running"}`

### Test 2: Python Health Check (if deployed)
```bash
curl https://campus-companion-python-ai.onrender.com/health
```
Expected: `{"status":"healthy","database":"connected",...}`

### Test 3: Frontend Loading
- Open `https://YOUR-VERCEL-URL.vercel.app` in browser
- Should load without errors
- Check browser console (F12 → Console) for any API errors

### Test 4: API Integration
- Login to frontend with test credentials
- Perform any agentic AI action (e.g., Study Planner)
- Should return data from deployed backend

---

## Troubleshooting

### Frontend Shows "Cannot Connect to API"
1. Verify `REACT_APP_API_URL` env var is set correctly in Vercel
2. Check backend is running: `curl https://campus-companion-backend.onrender.com/api/health`
3. Verify CORS is enabled in backend `server.js`

### Backend Service Won't Start
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure `MONGODB_URI` is correct and accessible from Render

### Python Service Won't Start
1. Check if all dependencies in `requirements.txt` are compatible
2. Verify `PYTHON_AI_PORT=8000` is set
3. Check logs for MongoDB connection errors

### MongoDB Connection Issues
1. Verify MongoDB Atlas IP whitelist includes Render IPs (usually open to 0.0.0.0/0)
2. Test connection string locally first
3. Check connection string has `?retryWrites=true&w=majority`

---

## Monitoring & Logs

### Render Logs
- Backend: Render Dashboard → campus-companion-backend → Logs
- Python: Render Dashboard → campus-companion-python-ai → Logs

### Vercel Logs
- Frontend: Vercel Dashboard → CampusCompanion → Deployments → Logs

### MongoDB Atlas Logs
- Go to MongoDB Atlas → Cluster → Logs → Event Log

---

## Production Considerations

1. **Security**:
   - Never commit `.env` files with secrets
   - Rotate API keys periodically
   - Use strong MongoDB passwords (current: `Niharika1234` — consider changing)

2. **Scaling**:
   - Upgrade Render instance type for higher traffic
   - Enable Vercel Analytics
   - Monitor MongoDB connection limits

3. **Backups**:
   - Enable MongoDB Atlas automatic backups
   - Regularly export critical data

4. **Custom Domain** (Optional):
   - Vercel: Add custom domain in dashboard
   - Render: Add custom domain in service settings
   - Update DNS records with provider

---

## Redeployment

If you make code changes:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Vercel**: Auto-deploys on `main` push (usually within 1-2 minutes)

3. **Render**: Auto-deploys on `main` push (usually within 2-3 minutes)

---

## Next Steps

1. ✅ Push code to GitHub (DONE)
2. ⏳ Deploy backend on Render (follow Part 1)
3. ⏳ Deploy frontend on Vercel (follow Part 2)
4. ⏳ (Optional) Deploy Python service on Render (follow Part 3)
5. ⏳ Test all services (follow Part 4)
6. ⏳ Configure custom domain (optional)

Good luck! 🚀
