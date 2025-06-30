# Expense Tracker Launcher Script
# This script can be used as a shortcut target from anywhere

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the project directory
Set-Location $ScriptDir

# Check if we're in the right directory (look for pom.xml)
if (-not (Test-Path "pom.xml")) {
    Write-Host "Error: pom.xml not found. Please ensure this script is in the Expense Tracker project directory." -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Host "Error: frontend directory not found. Please ensure this script is in the Expense Tracker project directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Maven wrapper exists
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "Error: Maven wrapper (mvnw.cmd) not found. Please ensure this script is in the Expense Tracker project directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting Expense Tracker..." -ForegroundColor Green
Write-Host "Project directory: $PWD" -ForegroundColor Cyan
Write-Host ""

# Start the Spring Boot backend using Maven wrapper
Write-Host "Starting Spring Boot backend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$ScriptDir`" && .\mvnw spring-boot:run" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start the React frontend using the batch file to prevent browser opening
Write-Host "Starting React frontend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$ScriptDir\frontend`" && start-react-no-browser.bat" -WindowStyle Normal

# Wait for frontend to start
Start-Sleep -Seconds 15

# Open the browser manually
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Expense Tracker is running!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "H2 Console: http://localhost:8080/h2-console" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the services:" -ForegroundColor Yellow
Write-Host "1. Close the browser tabs" -ForegroundColor Gray
Write-Host "2. Close the 'Spring Boot Backend' and 'React Frontend' command windows" -ForegroundColor Gray
Write-Host "3. Or press Ctrl+C in each command window" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "Launcher exited. Services are still running." -ForegroundColor Green
Write-Host "Remember to manually close the service windows when done." -ForegroundColor Yellow 