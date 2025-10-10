# Start Here Script - Setzt alles korrekt und führt Git-Befehle aus
# Dieses Script löst alle PATH-Probleme

Write-Host "🚀 Trainings App - Git & GitHub Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# PATH setzen
$env:Path = "C:\Program Files\Git\bin;" + $env:Path
$env:Path = "C:\Users\nickz\.bun\bin;" + $env:Path

# In das Projektverzeichnis wechseln
Set-Location "C:\Users\nickz\Documents\Trainingsapp2"

Write-Host "✅ Git Version:" -ForegroundColor Yellow
git --version

Write-Host ""
Write-Host "📋 Aktueller Git Status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "🔧 Verfügbare Optionen:" -ForegroundColor Cyan
Write-Host "1. GitHub Repository erstellen und verbinden"
Write-Host "2. Nur Git-Befehle ausführen"
Write-Host "3. Projekt starten"
Write-Host ""

$choice = Read-Host "Wähle Option (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔗 GitHub Repository Setup:" -ForegroundColor Yellow
        Write-Host "1. Gehe zu: https://github.com/new"
        Write-Host "2. Repository Name: 'traint-app'"
        Write-Host "3. Wähle: 'Private'"
        Write-Host "4. Lass alle Optionen UNGEHACKT"
        Write-Host "5. Klicke: 'Create repository'"
        Write-Host ""
        
        $ready = Read-Host "Repository erstellt? (j/n)"
        if ($ready -eq "j") {
            Write-Host "🔗 Verbinde mit GitHub..." -ForegroundColor Yellow
            git remote remove origin 2>$null
            git remote add origin https://github.com/nickZenker/traint-app.git
            git push -u origin main
            
            Write-Host ""
            Write-Host "✅ Erfolgreich mit GitHub verbunden!" -ForegroundColor Green
            Write-Host "🌐 Repository: https://github.com/nickZenker/traint-app" -ForegroundColor Cyan
        }
    }
    "2" {
        Write-Host ""
        Write-Host "💡 Git-Befehle (PATH ist bereits gesetzt):" -ForegroundColor Yellow
        Write-Host "git status"
        Write-Host "git add ."
        Write-Host "git commit -m 'Beschreibung'"
        Write-Host "git push"
        Write-Host ""
        Write-Host "Gib jetzt Git-Befehle ein..." -ForegroundColor Cyan
    }
    "3" {
        Write-Host ""
        Write-Host "🚀 Starte Projekt..." -ForegroundColor Yellow
        Write-Host "PATH ist gesetzt - führe jetzt aus:"
        Write-Host "bun run dev" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Ungültige Auswahl" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Nützliche Befehle:" -ForegroundColor Green
Write-Host "Git: git status, git add ., git commit -m 'msg', git push"
Write-Host "Dev: bun run dev"
Write-Host "Test: bun run test:e2e"
Write-Host ""
Write-Host "💡 Tipp: PATH ist jetzt in dieser Session gesetzt!" -ForegroundColor Yellow

