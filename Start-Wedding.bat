@echo off
setlocal
cd /d "%~dp0"
set "PORT=3000"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js 20 or newer, then try again.
  pause
  exit /b 1
)

netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo The wedding website is already running at http://localhost:%PORT%
  start "" "http://localhost:%PORT%"
  exit /b 0
)

if not exist "node_modules" (
  echo Installing project dependencies for the first time...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting the wedding website at http://localhost:%PORT%
start "Wedding Browser" /b cmd.exe /d /c "ping 127.0.0.1 -n 5 >nul ^& start http://localhost:%PORT%"
call npm.cmd run dev -- --port %PORT%
