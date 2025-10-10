# Final GitHub Connection Script
# Verbindet dein Projekt mit GitHub

Write-Host "🔗 GitHub Verbindung - Final Setup" -ForegroundColor Green
Write-Host ""

# Git PATH setzen
$env:Path = "C:\Program Files\Git\bin;" + $env:Path

# In das Projektverzeichnis wechseln
Set-Location "C:\Users\nickz\Documents\Trainingsapp2"

Write-Host "📋 Aktueller Status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "🔍 Repository Information:" -ForegroundColor Yellow
Write-Host "Username: nickZenker"
Write-Host "Repository: traint-app"
Write-Host ""

Write-Host "⚠️  Mögliche Probleme:" -ForegroundColor Red
Write-Host "1. Repository 'traint-app' existiert nicht"
Write-Host "2. Repository ist privat und du bist nicht authentifiziert"
Write-Host "3. Repository-Name ist anders"
Write-Host ""

Write-Host "🔧 Lösungen:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Repository überprüfen"
Write-Host "Gehe zu: https://github.com/nickZenker/traint-app"
Write-Host "Falls es nicht existiert, erstelle es neu"
Write-Host ""

Write-Host "Option 2: Personal Access Token verwenden"
Write-Host "1. Gehe zu: https://github.com/settings/tokens"
Write-Host "2. Erstelle neuen Token mit 'repo' Berechtigung"
Write-Host "3. Verwende Token statt Passwort"
Write-Host ""

Write-Host "Option 3: Repository neu erstellen"
Write-Host "1. Gehe zu: https://github.com/new"
Write-Host "2. Name: 'traint-app' oder 'trainingsapp2'"
Write-Host "3. Wähle 'Private'"
Write-Host "4. Lass alle Optionen UNGEHACKT"
Write-Host ""

# Versuche die Verbindung
Write-Host "🔗 Versuche GitHub-Verbindung..." -ForegroundColor Yellow

# Remote hinzufügen
git remote add origin "https://github.com/nickZenker/traint-app.git"

Write-Host "📤 Push zu GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "✅ Wenn erfolgreich: Projekt ist auf GitHub!" -ForegroundColor Green
Write-Host "🌐 Repository: https://github.com/nickZenker/traint-app" -ForegroundColor Cyan
Write-Host ""
Write-Host "❌ Falls fehlgeschlagen: Siehe Lösungen oben" -ForegroundColor Red

Write-Host ""
Write-Host "💡 Alternative Repository-Namen zum Testen:" -ForegroundColor Yellow
Write-Host "- trainingsapp2"
Write-Host "- training-app" 
Write-Host "- traint-app"
Write-Host ""

Write-Host "🔧 Manuelle Befehle falls nötig:" -ForegroundColor Cyan
Write-Host "git remote remove origin"
Write-Host "git remote add origin https://github.com/nickZenker/REPOSITORY_NAME.git"
Write-Host "git push -u origin main"
