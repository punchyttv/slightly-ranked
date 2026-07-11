@echo off
cd /d "%~dp0"
echo Starting Slightly Ranked...
echo.
if not exist node_modules (
  echo Installing files first time only...
  npm install
)
echo.
echo Open this for your overlay:
echo http://localhost:3000/overlay
echo.
echo Open this for dashboard/test buttons:
echo http://localhost:3000
echo.
npm start
pause
