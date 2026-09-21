@echo off
setlocal
cd /d "%~dp0"
if not exist backend\node_modules (
  echo Installing backend dependencies...
  cd backend && call npm install && cd ..
)
if not exist frontend\node_modules (
  echo Installing frontend dependencies...
  cd frontend && call npm install && cd ..
)
echo Building frontend...
cd frontend && call npm run build && cd ..
if not exist backend\.env copy backend\.env.example backend\.env >nul
if not exist backend\src\data\db.json (
  cd backend && call node src\seed.js && cd ..
)
start "ACV Server" /min /D "%~dp0backend" cmd /c "npm start"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5000/"
echo.
echo ACV Platform is running at http://localhost:5000/
echo Keep the server window running while using the system.
pause
