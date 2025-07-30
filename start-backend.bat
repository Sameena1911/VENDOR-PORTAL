@echo off
echo ===========================================
echo Starting Vendor Portal Backend Server
echo ===========================================

cd /d "c:\Users\samee\OneDrive\Desktop\VENDOR PORTAL\backend-node"

echo Checking Node.js...
node --version

echo.
echo Starting server on port 3001...
echo Backend API will be available at: http://localhost:3001
echo.
echo Login Credentials:
echo   Vendor ID: 0000100000
echo   Password: 123
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
