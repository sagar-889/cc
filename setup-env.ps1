# CampusCompanion Environment Setup Script
# Run this script to automatically create .env files

Write-Host "🚀 CampusCompanion Environment Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Create backend .env
Write-Host "📁 Creating backend/.env file..." -ForegroundColor Yellow

$backendEnv = @"
# ============================================
# CampusCompanion Backend Environment Variables
# ============================================

# DATABASE CONFIGURATION
MONGODB_URI=mongodb+srv://campusadmin:Niharika1234@cluster0.3c4ud6.mongodb.net/campus-companion?retryWrites=true&w=majority&appName=Cluster0

# SERVER CONFIGURATION
PORT=5000
NODE_ENV=development

# FRONTEND CONFIGURATION
FRONTEND_URL=http://localhost:3000

# AUTHENTICATION
JWT_SECRET=f83e4143b1527dd6d4acba63854767487800dbee1265473269ce8126314dc3b20ac276c2172d04c9c8b9a352dc07b004ee04e902cd43f829b0a7eb4130517764
JWT_EXPIRES_IN=7d

# AI API KEYS - CRITICAL FOR AI FEATURES TO WORK
GEMINI_API_KEY=AIzaSyC6fF4iG2PqZWhYof853H9V8U058V3-X4A

# FILE UPLOAD CONFIGURATION
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
"@

$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8 -NoNewline

if (Test-Path "backend\.env") {
    Write-Host "✅ backend/.env created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create backend/.env" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create frontend .env
Write-Host "📁 Creating frontend/.env file..." -ForegroundColor Yellow

$frontendEnv = @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=CampusCompanion
"@

$frontendEnv | Out-File -FilePath "frontend\.env" -Encoding UTF8 -NoNewline

if (Test-Path "frontend\.env") {
    Write-Host "✅ frontend/.env created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create frontend/.env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's been configured:" -ForegroundColor Cyan
Write-Host "  ✅ MongoDB Atlas connection" -ForegroundColor White
Write-Host "  ✅ JWT authentication" -ForegroundColor White
Write-Host "  ✅ Gemini AI API key (FREE)" -ForegroundColor White
Write-Host "  ✅ Server ports (5000 for backend, 3000 for frontend)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Install dependencies:" -ForegroundColor White
Write-Host "     cd backend && npm install" -ForegroundColor Gray
Write-Host "     cd frontend && npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start the servers:" -ForegroundColor White
Write-Host "     Terminal 1: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "     Terminal 2: cd frontend && npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - SETUP_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "   - CREATE_ENV_FILES.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy Coding!" -ForegroundColor Green
