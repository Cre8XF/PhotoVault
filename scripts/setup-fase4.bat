@echo off
REM PhotoVault FASE 4 - Quick Start Script (Windows)
REM Dette scriptet setter opp hele Capacitor-miljøet automatisk

echo ========================================
echo PhotoVault FASE 4 - Quick Start
echo ========================================
echo.

REM Sjekk om Node.js er installert
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js ikke funnet. Installer Node.js først.
    exit /b 1
)

echo OK Node.js funnet
node -v
echo.

REM Installer dependencies
echo Installerer dependencies...
call npm install

REM Bygg React-app
echo.
echo Bygger React-app...
call npm run build

REM Initialiser Capacitor
echo.
echo Initialiserer Capacitor...
call npx cap init PhotoVault com.cre8web.photovault --web-dir=build

REM Legg til Android platform (kun Android på Windows)
echo.
echo Legger til Android platform...
call npx cap add android

REM Synkroniser
echo.
echo Synkroniserer assets...
call npx cap sync

echo.
echo ========================================
echo OK FASE 4 Setup Fullfort!
echo ========================================
echo.
echo Neste steg:
echo    Android: npm run cap:open:android
echo.
echo Les DEPLOYMENT_GUIDE.md for mer informasjon
echo.
echo MERK: For iOS-utvikling trenger du macOS
echo ========================================

pause
