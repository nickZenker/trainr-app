# GitHub Repository Creation Guide
# Dieses Script führt dich durch die Erstellung des GitHub-Repositories

Write-Host "🚀 GitHub Repository Setup für 'traint-app'" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# PATH setzen
$env:Path = "C:\Program Files\Git\bin;" + $env:Path

Write-Host "📋 SCHRITT 1: GitHub Repository erstellen" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Gehe zu: https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Repository Name: traint-app" -ForegroundColor Cyan
Write-Host "3. Beschreibung: Trainings App - Next.js 15 + Supabase" -ForegroundColor Cyan
Write-Host "4. Wähle: 'Private' (empfohlen)" -ForegroundColor Cyan
Write-Host "5. Lass alle Optionen UNGEHACKT (kein README, .gitignore, License)" -ForegroundColor Cyan
Write-Host "6. Klicke: 'Create repository'" -ForegroundColor Cyan
Write-Host ""

$ready = Read-Host "Repository erstellt? (j/n)"

if ($ready -eq "j") {
    Write-Host ""
    Write-Host "🔗 SCHRITT 2: Repository verbinden" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Remote setzen
    git remote remove origin 2>$null
    git remote add origin https://github.com/nickZenker/traint-app.git
    
    Write-Host "✅ Remote 'origin' gesetzt auf: https://github.com/nickZenker/traint-app.git" -ForegroundColor Green
    Write-Host ""
    
    # Branch auf main setzen
    git branch -M main
    Write-Host "✅ Branch auf 'main' umbenannt" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📤 SCHRITT 3: Projekt hochladen" -ForegroundColor Yellow
    Write-Host "==============================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Versuche Push zu GitHub..." -ForegroundColor Cyan
    
    try {
        git push -u origin main
        Write-Host ""
        Write-Host "🎉 ERFOLGREICH!" -ForegroundColor Green
        Write-Host "=============" -ForegroundColor Green
        Write-Host "✅ Repository erstellt: https://github.com/nickZenker/traint-app" -ForegroundColor Green
        Write-Host "✅ Projekt hochgeladen" -ForegroundColor Green
        Write-Host "✅ Verbindung hergestellt" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Öffne das Repository: https://github.com/nickZenker/traint-app" -ForegroundColor Cyan
        
    } catch {
        Write-Host ""
        Write-Host "❌ FEHLER beim Push:" -ForegroundColor Red
        Write-Host "===================" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Mögliche Lösungen:" -ForegroundColor Yellow
        Write-Host "1. Überprüfe deine GitHub-Anmeldedaten" -ForegroundColor Yellow
        Write-Host "2. Stelle sicher, dass das Repository 'traint-app' existiert" -ForegroundColor Yellow
        Write-Host "3. Verwende Personal Access Token statt Passwort" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📖 Anleitung für Personal Access Token:" -ForegroundColor Cyan
        Write-Host "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" -ForegroundColor Cyan
    }
    
} else {
    Write-Host ""
    Write-Host "⚠️  Bitte erstelle zuerst das Repository auf GitHub:" -ForegroundColor Yellow
    Write-Host "https://github.com/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dann führe dieses Script erneut aus." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Nützliche Git-Befehle:" -ForegroundColor Green
Write-Host "git status          - Status anzeigen" -ForegroundColor White
Write-Host "git add .           - Alle Änderungen hinzufügen" -ForegroundColor White
Write-Host "git commit -m 'msg' - Änderungen committen" -ForegroundColor White
Write-Host "git push            - Auf GitHub hochladen" -ForegroundColor White
