# CampusCompanion Startup Script
Write-Host "🚀 Starting CampusCompanion..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are available" -ForegroundColor Green

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Magenta; npm start"

Write-Host "🎉 CampusCompanion is starting up!" -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "⏳ Please wait for both servers to fully start..." -ForegroundColor Yellow

# Wait for user input before closing
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
