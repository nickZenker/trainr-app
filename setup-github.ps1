# GitHub Setup Script für Trainings App
# Führe dieses Script aus, nachdem du ein GitHub Repository erstellt hast

Write-Host "🚀 GitHub Setup für Trainings App" -ForegroundColor Green
Write-Host ""

# Git PATH setzen
$env:Path = "C:\Program Files\Git\bin;" + $env:Path

# In das Projektverzeichnis wechseln
Set-Location "C:\Users\nickz\Documents\Trainingsapp2"

Write-Host "📋 Aktueller Git Status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "🔧 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "1. Gehe zu https://github.com/new"
Write-Host "2. Repository Name: trainingsapp2"
Write-Host "3. Wähle 'Private'"
Write-Host "4. Lass alle Optionen UNGEHACKT (kein README, .gitignore, etc.)"
Write-Host "5. Klicke 'Create repository'"
Write-Host ""

$githubUsername = Read-Host "Gib deinen GitHub Benutzernamen ein"

if ($githubUsername) {
    Write-Host ""
    Write-Host "🔗 Verbinde mit GitHub Repository..." -ForegroundColor Yellow
    
    # Remote hinzufügen
    git remote add origin "https://github.com/$githubUsername/trainingsapp2.git"
    
    # Zum main Branch wechseln (falls noch nicht)
    git branch -M main
    
    # Ersten Push machen
    Write-Host "📤 Push zu GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ Erfolgreich mit GitHub verbunden!" -ForegroundColor Green
    Write-Host "🌐 Repository URL: https://github.com/$githubUsername/trainingsapp2" -ForegroundColor Cyan
} else {
    Write-Host "❌ Kein Benutzername eingegeben. Bitte das Script erneut ausführen." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Für zukünftige Git-Befehle:" -ForegroundColor Yellow
Write-Host "   git add ."
Write-Host "   git commit -m 'Beschreibung der Änderungen'"
Write-Host "   git push"
Write-Host ""
Write-Host "🎉 Fertig! Dein Projekt ist jetzt mit GitHub verbunden." -ForegroundColor Green

