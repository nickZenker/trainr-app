# Supabase Auth Fix - Dashboard Konfiguration

## Supabase Dashboard → Authentication → URL Configuration

### Site URL
```
http://localhost:3001
```

### Redirect URLs (einer pro Zeile)
```
http://localhost:3001/auth/callback
http://localhost:3001/auth/confirm
http://localhost:3001/auth/login
http://localhost:3001/auth/signup
```

### Allow localhost CORS origins
```
http://localhost:3001
```

## Auth Provider Settings
- ✅ **Email aktiv** (Password Authentication)
- ❌ **Magic Links** optional aus (kann später aktiviert werden)

## Hinweise
- Für Preview/Production später Domain + `https://<deine-domain>/auth/callback` ergänzen
- Nach Änderungen im Dashboard: 1-2 Minuten warten bis Konfiguration aktiv ist
- PKCE Flow ist standardmäßig aktiviert in Supabase v2

## Troubleshooting
- **400-Fehler**: Prüfe ob alle URLs in "Redirect URLs" eingetragen sind
- **CORS-Fehler**: Prüfe "Allow localhost CORS origins"
- **Session nicht persistiert**: Prüfe PKCE Flow Konfiguration im Client

