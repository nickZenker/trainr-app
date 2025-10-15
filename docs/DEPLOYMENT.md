# Deployment Guide - Trainr App

## Vercel + Supabase Deployment

### 1. Vercel Setup (GitHub Import)

1. **Importiere Repo in Vercel**: New Project → GitHub Repo `nickZenker/trainr-app`
2. **Framework**: Next.js (Auto-erkannt)
3. **ENV setzen** (Projekt-Einstellungen → Environment Variables) – NUR Namen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (https://<deine-domain> oder Vercel-Preview URL)
   - OPTIONAL: `NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_ENABLE_ANALYTICS`
4. **CORS/Redirects in Supabase**: wie in `docs/AUTH_FIX.md`
5. **Klick "Deploy"**

### 2. Environment Variables

Setze folgende Umgebungsvariablen in Vercel (Settings → Environment Variables):

#### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Deine Supabase Projekt-URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon/Public Key
- `SUPABASE_SERVICE_KEY` - Supabase Service Role Key (Server-side only)
- `NEXT_PUBLIC_SITE_URL` - Deine Domain (z.B. `https://trainr.vercel.app`)

#### Optional
- `NEXT_PUBLIC_MAP_TILE_URL` - Für Karten-Features
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Analytics aktivieren
- `NEXT_PUBLIC_ENABLE_DEBUG_LOGS` - Debug-Logs aktivieren

### 3. Supabase CORS Konfiguration

1. Gehe zu deinem Supabase Dashboard
2. Settings → API
3. Unter "CORS" füge hinzu:
   - `https://your-domain.vercel.app` (Production)
   - `https://your-project-git-main-username.vercel.app` (Preview URLs)

### 4. Supabase RLS/Policies

Stelle sicher, dass Row Level Security aktiviert ist:

```sql
-- Alle Tabellen haben RLS aktiviert
-- Policies sind owner-basiert (user_id = auth.uid())
-- Teste mit: SELECT * FROM auth.users LIMIT 1;
```

**Kurzcheckliste:**
- ✅ `profiles` - RLS aktiv, Policy für user_id
- ✅ `plans` - RLS aktiv, Policy für user_id  
- ✅ `sessions` - RLS aktiv, Policy über plans.user_id
- ✅ `live_sessions` - RLS aktiv, Policy für user_id
- ✅ `set_logs` - RLS aktiv, Policy über live_sessions.user_id

### 5. Health Check

Die App stellt einen Health-Check bereit:
- **URL**: `/api/health`
- **Status**: Immer 200 (auch bei DB-Fehlern)
- **Response**: `{"ok": true, "time": "...", "buildHash": "...", "env": {...}}`

### 6. Build & Start

Vercel Standard-Konfiguration:
- **Framework**: Next.js (automatisch erkannt)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

Kein `vercel.json` zwingend erforderlich - Server Actions + App Router funktionieren out-of-the-box.

### 7. Post-Deploy Smoke (Prod)

**Diagnostic Endpoints:**
- [ ] `GET /api/health` → 200
- [ ] `GET /api/version` → buildHash sichtbar (oder "dev")
- [ ] `GET /api/runtime` → region=…

**Core Features:**
- [ ] `/app` → Login/Signup
- [ ] `/app/plans` → Plan anlegen
- [ ] `/app/sessions` → Session planen
- [ ] `/app/calendar?view=month` → Event sichtbar, lokale Zeit + Typ-Badge
- [ ] `/app/live/<id>` → Start/Stop + Set loggen (falls Daten vorhanden)

### 8. Troubleshooting

#### 404 auf /app
- **Ursache**: Middleware/Auth-Problem
- **Lösung**: Prüfe `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 500 Internal Server Error
- **Ursache**: Environment Variables fehlen
- **Lösung**: Prüfe alle Required ENV-Variablen in Vercel

#### 401 Unauthorized
- **Ursache**: Supabase Keys falsch
- **Lösung**: Prüfe Keys in Supabase Dashboard → Settings → API

#### Database Errors
- **Ursache**: RLS-Policies oder fehlende Tabellen
- **Lösung**: Führe `COMPLETE_DATABASE_FIX.sql` in Supabase aus

### 9. Monitoring

#### Health Check Monitoring
```bash
# Test Health Endpoint
curl https://your-domain.vercel.app/api/health

# Expected Response
{
  "ok": true,
  "time": "2025-01-14T...",
  "buildHash": "abc12345",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
    "SUPABASE_SERVICE_KEY": true
  }
}
```

#### Vercel Analytics
- Automatisch verfügbar in Vercel Dashboard
- Optional: Google Analytics über `NEXT_PUBLIC_ENABLE_ANALYTICS`

### 10. Updates & Rollbacks

#### Updates
1. Push zu `main` Branch
2. Vercel deploys automatisch
3. Teste in Vercel Preview URLs

#### Rollbacks
1. Vercel Dashboard → Deployments
2. Klicke auf vorherigen Deployment
3. "Promote to Production"

---

## Quick Start Checklist

- [ ] Vercel Projekt erstellt
- [ ] GitHub Repo verbunden
- [ ] ENV-Variablen gesetzt
- [ ] Supabase CORS konfiguriert
- [ ] RLS-Policies aktiv
- [ ] Deployment erfolgreich
- [ ] Health Check OK
- [ ] Login/Registration funktioniert
- [ ] Core Features getestet
- [ ] Zeit-Zeitzone korrekt

**Ready for Production! 🚀**

