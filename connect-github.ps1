# GitHub Connection Script
# Führt dich durch die Verbindung mit deinem GitHub Repository

Write-Host "🔗 GitHub Repository Verbindung" -ForegroundColor Green
Write-Host ""

# Git PATH setzen
$env:Path = "C:\Program Files\Git\bin;" + $env:Path

# In das Projektverzeichnis wechseln
Set-Location "C:\Users\nickz\Documents\Trainingsapp2"

Write-Host "📋 Aktueller Status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "🔍 GitHub Repository Information:" -ForegroundColor Yellow
Write-Host "Du hast gesagt:"
Write-Host "- Username: nick.zenker@hotmail.de"
Write-Host "- Repository: traint-app"
Write-Host ""

Write-Host "⚠️  Wichtige Information:" -ForegroundColor Red
Write-Host "GitHub verwendet NICHT die E-Mail-Adresse in der URL!"
Write-Host "GitHub verwendet deinen BENUTZERNAMEN (Username)."
Write-Host ""

Write-Host "🔧 So findest du deinen GitHub Username:" -ForegroundColor Cyan
Write-Host "1. Gehe zu https://github.com"
Write-Host "2. Logge dich ein"
Write-Host "3. Klicke auf dein Profil (rechts oben)"
Write-Host "4. Dein Username steht unter deinem Namen"
Write-Host ""

$githubUsername = Read-Host "Gib deinen GitHub Username ein (NICHT die E-Mail!)"

if ($githubUsername) {
    Write-Host ""
    Write-Host "🔗 Verbinde mit GitHub..." -ForegroundColor Yellow
    
    # Alten Remote entfernen
    git remote remove origin 2>$null
    
    # Neuen Remote hinzufügen
    $repoUrl = "https://github.com/$githubUsername/traint-app.git"
    git remote add origin $repoUrl
    
    Write-Host "📤 Push zu GitHub..." -ForegroundColor Yellow
    Write-Host "Repository URL: $repoUrl" -ForegroundColor Cyan
    
    # Push mit Credentials
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ Erfolgreich verbunden!" -ForegroundColor Green
    Write-Host "🌐 Repository URL: https://github.com/$githubUsername/traint-app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Kein Username eingegeben." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Falls der Push fehlschlägt:" -ForegroundColor Yellow
Write-Host "1. Überprüfe, ob das Repository 'traint-app' existiert"
Write-Host "2. Überprüfe deinen GitHub Username"
Write-Host "3. Stelle sicher, dass du die richtigen Berechtigungen hast"
Write-Host ""

