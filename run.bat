@echo off
echo ========================================================
echo 🚀 Starting WorkHop Initialization...
echo ========================================================

cd workhop

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo ⚡ Starting the development server...
call npm run dev
