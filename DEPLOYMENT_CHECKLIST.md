# Quick Deployment Checklist

## ✅ Completed
- [x] Fixed all route imports and agentic AI features
- [x] Updated backend/python with MongoDB Atlas credentials
- [x] All three services verified running locally (backend port 5000, python port 8000, frontend port 3000)
- [x] Committed all changes to Git (~1800 files)
- [x] Pushed to GitHub: https://github.com/NiharikaAdigoppula/CampusCompanion
- [x] Created deployment guide (DEPLOYMENT_GUIDE.md)

## ⏳ TODO: Deploy to Cloud

### Deploy Backend on Render (Priority 1)
```
1. Go to https://render.com → Sign up with GitHub
2. New Web Service → Select CampusCompanion repository
3. Name: campus-companion-backend
4. Build: npm install
5. Start: npm start
6. Add Environment Variables:
   - MONGODB_URI: mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0
   - JWT_SECRET: campus-companion-super-secret-key-2025-niharika-project-xyz789
   - GEMINI_API_KEY: AIzaSyCM96WJhe2J9IGqOis01srq8jemIGki-qg
   - NODE_ENV: production
   - PORT: 5000
7. Deploy and save the URL (e.g., https://campus-companion-backend.onrender.com)
```

### Deploy Frontend on Vercel (Priority 2)
```
1. Go to https://vercel.com → Sign up with GitHub
2. Add New Project → Select CampusCompanion repository
3. Framework: Create React App (auto-detected)
4. Root Directory: frontend/
5. Add Environment Variable:
   - REACT_APP_API_URL: https://campus-companion-backend.onrender.com (from Render)
6. Deploy and save the URL (e.g., https://campus-companion.vercel.app)
```

### Update Backend FRONTEND_URL (Priority 3)
```
1. Go back to Render backend service
2. Edit environment variables
3. Add: FRONTEND_URL: https://YOUR-VERCEL-URL.vercel.app
4. Redeploy
```

### Deploy Python AI Service (Optional Priority 4)
```
1. Go to https://render.com
2. New Web Service → Select CampusCompanion repository
3. Name: campus-companion-python-ai
4. Environment: Python 3.11
5. Build: pip install -r python-ai-service/requirements.txt
6. Start: cd python-ai-service && python main.py
7. Add Environment Variables:
   - MONGODB_URI: (same as backend)
   - GEMINI_API_KEY: (same as backend)
   - PYTHON_AI_PORT: 8000
8. Deploy
```

## 🧪 Verification Commands

Once deployed, test with:

```bash
# Test backend
curl https://campus-companion-backend.onrender.com/api/health

# Test frontend
# Open in browser: https://YOUR-VERCEL-URL.vercel.app

# Test Python service (if deployed)
curl https://campus-companion-python-ai.onrender.com/health
```

## 📊 Current Architecture

```
GitHub Repository
├── Frontend (React)
│   └── Deployed on Vercel
│       └── REACT_APP_API_URL → Backend
├── Backend (Node.js + Express)
│   └── Deployed on Render
│       └── Connects to MongoDB Atlas
│       └── Proxies to Python AI Service
└── Python AI Service (FastAPI)
    └── (Optional) Deployed on Render
        └── Connects to MongoDB Atlas

MongoDB Atlas (Shared Database)
└── Single connection string for both Node and Python
```

## 🔐 Credentials Summary

| Service | Endpoint | Credentials |
|---------|----------|-------------|
| MongoDB Atlas | mongodb+srv://... | campusadmin / Niharika1234 |
| JWT | All backend endpoints | campus-companion-super-secret-key-2025-niharika-project-xyz789 |
| Gemini AI | Python service | AIzaSyCM96WJhe2J9IGqOis01srq8jemIGki-qg |

## 📞 Support

If deployment fails:
1. Check DEPLOYMENT_GUIDE.md Troubleshooting section
2. Verify all environment variables are set
3. Check MongoDB Atlas IP whitelist (usually 0.0.0.0/0)
4. Review logs in Render/Vercel dashboards
