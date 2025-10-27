@echo off
title PhotoVault Updater
set LOGFILE=update_log.txt

echo ============================================== > %LOGFILE%
echo 🔄 Oppdaterer PhotoVault fra GitHub... >> %LOGFILE%
echo Starttid: %date% %time% >> %LOGFILE%
echo ============================================== >> %LOGFILE%

cd /d "C:\Mine-Prosjekter\PhotoVault"

echo. >> %LOGFILE%
echo [1] Henter siste endringer... >> %LOGFILE%
git fetch --all >> %LOGFILE% 2>&1
git reset --hard origin/claude/phase-4-orchestration-011CUXbTCEBPvvfbwvbM4VVr >> %LOGFILE% 2>&1
git checkout claude/phase-4-orchestration-011CUXbTCEBPvvfbwvbM4VVr >> %LOGFILE% 2>&1
git pull origin claude/phase-4-orchestration-011CUXbTCEBPvvfbwvbM4VVr >> %LOGFILE% 2>&1

echo. >> %LOGFILE%
echo [2] Installerer avhengigheter... >> %LOGFILE%
call npm install >> %LOGFILE% 2>&1

echo. >> %LOGFILE%
echo [3] Starter PhotoVault... >> %LOGFILE%
call npm start >> %LOGFILE% 2>&1

echo. >> %LOGFILE%
echo Ferdig: %date% %time% >> %LOGFILE%

pause
