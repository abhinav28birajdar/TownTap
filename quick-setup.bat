@echo off
echo.
echo ===============================================
echo    TownTap Quick Setup and Optimization
echo ===============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed or not in PATH
    echo Please check your Node.js installation
    pause
    exit /b
)

:: Run the project setup script
echo Running project setup and optimization...
echo.
node scripts\project-setup.js

if %errorlevel% neq 0 (
    echo.
    echo Setup encountered some issues. Please check the output above.
) else (
    echo.
    echo Setup completed successfully!
)

echo.
echo Press any key to exit...
pause >nul
