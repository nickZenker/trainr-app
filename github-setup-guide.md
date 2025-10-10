# GitHub Setup Anleitung

## Problem
Das Repository wurde nicht gefunden. Das liegt daran, dass GitHub **nicht die E-Mail-Adresse** in der URL verwendet, sondern den **GitHub Username**.

## Lösung

### Option 1: GitHub Username finden
1. Gehe zu https://github.com
2. Logge dich mit `nick.zenker@hotmail.de` ein
3. Klicke auf dein Profil (rechts oben)
4. Dein **Username** steht unter deinem Namen (z.B. "nickzenker" oder ähnlich)
5. Führe das Script aus: `.\connect-github.ps1`

### Option 2: Personal Access Token (empfohlen)
1. Gehe zu https://github.com/settings/tokens
2. Klicke "Generate new token" → "Generate new token (classic)"
3. Gib einen Namen ein: "Trainings App"
4. Wähle Scopes: ✅ `repo` (Full control of private repositories)
5. Klicke "Generate token"
6. **Kopiere den Token** (du siehst ihn nur einmal!)

Dann führe aus:
```bash
git remote set-url origin https://GITHUB_USERNAME:YOUR_TOKEN@github.com/GITHUB_USERNAME/traint-app.git
git push -u origin main
```

### Option 3: Repository überprüfen
- Stelle sicher, dass das Repository "traint-app" existiert
- Gehe zu: https://github.com/DEIN_USERNAME/traint-app
- Falls es nicht existiert, erstelle es neu

## Aktuelle Git-Konfiguration
```bash
# Remote anzeigen
git remote -v

# Remote ändern (ersetze DEIN_USERNAME)
git remote set-url origin https://github.com/DEIN_USERNAME/traint-app.git

# Push
git push -u origin main
```

## Troubleshooting
- **"Repository not found"**: Falscher Username oder Repository existiert nicht
- **"Authentication failed"**: Falsches Passwort oder Token
- **"Permission denied"**: Keine Berechtigung für das Repository
