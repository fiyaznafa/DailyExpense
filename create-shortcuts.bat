@echo off
title Create Expense Tracker Shortcuts
color 0B

echo ========================================
echo    Creating Expense Tracker Shortcuts
echo ========================================
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_NAME=Expense Tracker"
set "SHORTCUT_NAME=Expense Tracker"

REM Get user's desktop and start menu paths
for /f "tokens=2*" %%a in ('reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop 2^>nul') do set "DESKTOP_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Startup 2^>nul') do set "STARTUP_PATH=%%b"

if "%DESKTOP_PATH%"=="" (
    echo ERROR: Could not find Desktop path!
    set "DESKTOP_PATH=%USERPROFILE%\Desktop"
)

if "%STARTUP_PATH%"=="" (
    echo ERROR: Could not find Startup path!
    set "STARTUP_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
)

echo Project directory: %SCRIPT_DIR%
echo Desktop path: %DESKTOP_PATH%
echo Startup path: %STARTUP_PATH%
echo.

REM Create PowerShell command for the shortcut
set "POWERSHELL_CMD=powershell.exe -ExecutionPolicy Bypass -File \"%SCRIPT_DIR%launch-expense-tracker.ps1\""

REM Create desktop shortcut
echo [1/3] Creating desktop shortcut...
set "DESKTOP_SHORTCUT=%DESKTOP_PATH%\%SHORTCUT_NAME%.lnk"

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP_SHORTCUT%'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-ExecutionPolicy Bypass -File \"%SCRIPT_DIR%launch-expense-tracker.ps1\"'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Launch Expense Tracker Application'; $Shortcut.IconLocation = '%SCRIPT_DIR%frontend\public\favicon.ico'; $Shortcut.Save()"

if exist "%DESKTOP_SHORTCUT%" (
    echo ✓ Desktop shortcut created successfully!
) else (
    echo ✗ Failed to create desktop shortcut
)

REM Create start menu shortcut
echo [2/3] Creating start menu shortcut...
set "STARTUP_SHORTCUT=%STARTUP_PATH%\%SHORTCUT_NAME%.lnk"

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_SHORTCUT%'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-ExecutionPolicy Bypass -File \"%SCRIPT_DIR%launch-expense-tracker.ps1\"'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Launch Expense Tracker Application (Auto-start)'; $Shortcut.IconLocation = '%SCRIPT_DIR%frontend\public\favicon.ico'; $Shortcut.Save()"

if exist "%STARTUP_SHORTCUT%" (
    echo ✓ Start menu shortcut created successfully!
) else (
    echo ✗ Failed to create start menu shortcut
)

REM Create batch file shortcut (alternative)
echo [3/3] Creating batch file shortcut...
set "BATCH_SHORTCUT=%DESKTOP_PATH%\%SHORTCUT_NAME% (Batch).lnk"

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%BATCH_SHORTCUT%'); $Shortcut.TargetPath = '%SCRIPT_DIR%start-expense-tracker.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Launch Expense Tracker Application (Batch)'; $Shortcut.IconLocation = '%SCRIPT_DIR%frontend\public\favicon.ico'; $Shortcut.Save()"

if exist "%BATCH_SHORTCUT%" (
    echo ✓ Batch shortcut created successfully!
) else (
    echo ✗ Failed to create batch shortcut
)

echo.
echo ========================================
echo    Shortcuts Created Successfully!
echo ========================================
echo.
echo Created shortcuts:
echo • Desktop: %DESKTOP_SHORTCUT%
echo • Start Menu: %STARTUP_SHORTCUT%
echo • Batch Alternative: %BATCH_SHORTCUT%
echo.
echo To use the shortcuts:
echo 1. Double-click any shortcut to start the app
echo 2. The start menu shortcut will auto-start with Windows
echo 3. You can pin shortcuts to taskbar for quick access
echo.
echo Note: First run may take longer as dependencies are downloaded
echo.
pause 