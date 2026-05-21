@echo off
title Amiral Batti Oyunu
echo ----------------------------------------------------
echo         Amiral Batti Oyun Sunucusu Baslatiliyor...
echo ----------------------------------------------------
echo.
echo Sunucu calistigi surece bu siyah ekrani ACIK TUTUN!
echo Oyunu durdurmak icin pencereyi kapatabilirsiniz.
echo.
cd /d "%~dp0"
node server.js
pause
