@echo off
title Expense Tracker Launcher
color 0A

echo ========================================
echo    Expense Tracker - Starting Up...
echo ========================================
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Check if we're in the right directory
if not exist "pom.xml" (
    echo ERROR: pom.xml not found!
    echo Please ensure this script is in the Expense Tracker project directory.
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please ensure this script is in the Expense Tracker project directory.
    pause
    exit /b 1
)

REM Check if Maven wrapper exists
if not exist "mvnw.cmd" (
    echo ERROR: Maven wrapper (mvnw.cmd) not found!
    echo Please ensure this script is in the Expense Tracker project directory.
    pause
    exit /b 1
)

echo Starting Expense Tracker...
echo Project directory: %CD%
echo.

REM Start the Spring Boot backend
echo [1/3] Starting Spring Boot backend...
start "Spring Boot Backend" cmd /k "cd /d "%SCRIPT_DIR%" && mvnw spring-boot:run"

REM Wait for backend to start
timeout /t 8 /nobreak >nul

REM Start the React frontend
echo [2/3] Starting React frontend...
start "React Frontend" cmd /k "cd /d "%SCRIPT_DIR%\frontend" && set BROWSER=none && npm start"

REM Wait for frontend to start
timeout /t 12 /nobreak >nul

REM Open the browser
echo [3/3] Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo    Expense Tracker is Running!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo H2 Console: http://localhost:8080/h2-console
echo.
echo To stop the services:
echo 1. Close the browser tabs
echo 2. Close the 'Spring Boot Backend' and 'React Frontend' command windows
echo 3. Or press Ctrl+C in each command window
echo.
echo Press any key to exit this launcher...
pause >nul

echo Launcher exited. Services are still running.
echo Remember to manually close the service windows when done.
timeout /t 3 /nobreak >nul 