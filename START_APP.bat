@echo off
echo ==============================================
echo   STARTING CRUSHER MANAGEMENT SYSTEM (CMS)
echo ==============================================
echo.
echo Installing and starting Backend Server (NestJS)...
cd nest-backend
start cmd /k "npm install && npm run start:dev"
cd ..

echo Installing and starting Frontend Server (Next.js)...
cd cms-frontend
start cmd /k "npm install && npm run dev"
cd ..

echo.
echo ==============================================
echo CMS is booting up!
echo Backend API will run on: http://localhost:5000
echo Frontend UI will run on: http://localhost:3000
echo.
echo Please wait about 15-30 seconds for the servers to start.
echo ==============================================
pause
