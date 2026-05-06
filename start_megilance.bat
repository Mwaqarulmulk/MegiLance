@echo off
if "%1"=="backend" goto run_backend
if "%1"=="frontend" goto run_frontend

TITLE MegiLance Intelligent Local Runner
COLOR 0A

echo ==================================================
echo    MegiLance Intelligent Local Runner
echo ==================================================
echo Starting Backend and Frontend with auto-restart...

start "MegiLance - Backend" cmd /c "%~f0" backend
timeout /t 3 /nobreak >nul
start "MegiLance - Frontend" cmd /c "%~f0" frontend

echo.
echo [SUCCESS] Both services have been launched in background windows!
echo - Backend API: http://localhost:8000
echo - Frontend UI: http://localhost:3000
echo.
pause
exit

:run_backend
TITLE MegiLance - Backend 8000
COLOR 09
cd /d "%~dp0"
if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat)
cd backend
:backend_loop
python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
echo [WARN] Backend crashed. Restarting...
timeout /t 3 /nobreak >nul
goto backend_loop

:run_frontend
TITLE MegiLance - Frontend 3000
COLOR 0E
cd /d "%~dp0"
cd frontend
:frontend_loop
call npm run dev
echo [WARN] Frontend crashed. Restarting...
timeout /t 3 /nobreak >nul
goto frontend_loop
