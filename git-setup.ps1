# Git Setup Script - Führt Git-Befehle mit korrektem PATH aus

Write-Host "🔧 Git Setup & GitHub Verbindung" -ForegroundColor Green
Write-Host ""

# Git PATH permanent setzen
$env:Path = "C:\Program Files\Git\bin;" + $env:Path

# In das Projektverzeichnis wechseln
Set-Location "C:\Users\nickz\Documents\Trainingsapp2"

Write-Host "✅ Git Version:" -ForegroundColor Yellow
git --version

Write-Host ""
Write-Host "📋 Aktueller Git Status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "🔗 GitHub Repository Verbindung:" -ForegroundColor Cyan
Write-Host "Username: nickZenker"
Write-Host "Repository: traint-app"
Write-Host ""

# Remote entfernen falls vorhanden
Write-Host "🧹 Entferne alten Remote..." -ForegroundColor Yellow
git remote remove origin 2>$null

# Neuen Remote hinzufügen
Write-Host "🔗 Füge GitHub Remote hinzu..." -ForegroundColor Yellow
git remote add origin https://github.com/nickZenker/traint-app.git

Write-Host "📤 Push zu GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "✅ Git-Befehle ausgeführt!" -ForegroundColor Green

Write-Host ""
Write-Host "💡 Für zukünftige Git-Befehle:" -ForegroundColor Cyan
Write-Host "Verwende dieses Script oder setze den PATH manuell:"
Write-Host '$env:Path = "C:\Program Files\Git\bin;" + $env:Path'
Write-Host ""

Write-Host "🎯 Repository URL:" -ForegroundColor Yellow
Write-Host "https://github.com/nickZenker/traint-app" -ForegroundColor Cyan

