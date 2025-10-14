# Trainings App

Eine moderne, modulare Trainings-App für Kraft & Ausdauer, Routen, Ernährung, Kalender und Progression/Analytics mit Wearable-Integrationen.

## 🚀 Features

- **Auth**: E-Mail/Passwort Login mit Supabase
- **Pläne**: Trainingspläne erstellen und verwalten
- **Sessions**: Kraft- und Cardio-Trainingseinheiten
- **Live Training**: Echtzeit-Tracking mit Timer und Set-Logging
- **Profil**: Fortschritt, Körperdaten, Ziele und Erfolge
- **Routen**: GPS-Tracking und Karten-Integration (geplant)
- **Ernährung**: Kalorien- und Makronährstoff-Tracking (geplant)
- **Integrationen**: Garmin, Strava, Apple Health (geplant)

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Language**: JavaScript (kein TypeScript)
- **Maps**: OpenStreetMap mit Leaflet (geplant)
- **Testing**: Playwright E2E (geplant)

## 📋 Voraussetzungen

- Node.js 18+ oder Bun
- Supabase Account
- Git

## 🔧 Setup

### 1. Repository klonen

```bash
git clone <repository-url>
cd trainingsapp2
```

### 2. Abhängigkeiten installieren

```bash
# Mit Bun (empfohlen)
bun install

# Oder mit npm
npm install
```

### 3. Umgebungsvariablen

Kopiere `env.example` zu `.env.local` und fülle die Werte aus:

```bash
cp env.example .env.local
```

#### Erforderliche Variablen

```env
# Supabase Configuration (ERFORDERLICH)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

#### Optionale Variablen

```env
# Garmin Integration
GARMIN_CLIENT_ID=your-garmin-client-id
GARMIN_CLIENT_SECRET=your-garmin-client-secret
GARMIN_REDIRECT_URI=http://localhost:3001/api/auth/garmin/callback

# Monitoring & Error Tracking
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Map Services
MAPBOX_ACCESS_TOKEN=your-mapbox-token
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Feature Flags
NEXT_PUBLIC_ENABLE_GARMIN_INTEGRATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Trainr App
```

**Hinweis**: Alle Variablen außer den Supabase-Keys sind optional. Siehe `env.example` für eine vollständige Liste mit Beschreibungen.

### 4. Supabase Setup

1. Erstelle ein neues Projekt in [Supabase](https://supabase.com)
2. Kopiere URL und Anon Key in `.env.local`
3. Führe die Datenbank-Migrationen aus:

```sql
-- In Supabase SQL Console ausführen:
-- 1. database/migrations/001_initial_schema.sql
-- 2. database/migrations/002_rls_policies.sql
```

4. (Optional) Demo-Daten laden:
```sql
-- Ersetze 'demo-user-uuid' mit deiner User-ID in:
-- database/seeds/demo_data.sql
```

### 5. Entwicklungsserver starten

```bash
# Mit Bun
bun dev

# Oder mit npm
npm run dev
```

Die App ist verfügbar unter `http://localhost:3001`

## 🔧 Backend-Zugriff

Die Anwendung nutzt primär **Server Actions** mit direkten Supabase-Zugriffen für optimale Performance und Einfachheit. REST-APIs werden nur für externe Integrationen verwendet. Siehe [ADR-0001](docs/ADR/0001-backend-access.md) für Details zur Architekturentscheidung.

## 🛡 Qualität & Guardrails

### Health Checks
- `/api/health` - Robuster Health-Endpoint mit Build-Hash und ENV-Status
- Immer 200 Status (auch bei internen Fehlern)
- Build-Hash aus Vercel oder Git (falls verfügbar)

### Logging
- Serverseitige Fehler mit klaren Messages (ohne Secrets)
- Service-spezifische Log-Prefixes für bessere Debugging
- Client-seitige console.error reduziert

### Pre-commit Hooks (TODO)
```bash
# Optional: Lint-staged für automatische Code-Qualität
npm install --save-dev lint-staged husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── plans/         # Trainingspläne CRUD
│   │   ├── sessions/      # Sessions CRUD
│   │   ├── exercises/     # Übungen CRUD
│   │   ├── routes/        # GPS-Routen CRUD
│   │   └── live-sessions/ # Live Training
│   ├── auth/              # Auth-Seiten
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   └── app/               # Haupt-App (geschützt)
│       ├── plans/         # Pläne verwalten
│       ├── sessions/      # Sessions verwalten
│       ├── live/          # Live Training
│       └── profile/       # Profil & Einstellungen
├── lib/                   # Utilities
│   ├── supabaseClient.js  # Browser Supabase Client
│   ├── supabaseServer.js  # Server Supabase Client mit Cookie-Handling
│   ├── api-utils.js       # API-Utilities (Validierung, Fehlerbehandlung)
│   └── env-validation.js  # Environment-Validierung mit Zod
└── components/            # UI Komponenten (geplant)

database/
├── migrations/            # SQL Migrations
├── seeds/                 # Demo-Daten
└── README.md             # DB-Dokumentation
```

## 🎨 Design System

### Farben (Orange/Dunkelblau)

- **Primary**: Orange `#f59e0b` (`--color-brand`)
- **Background**: Dunkelblau `#0f172a` (`--color-background`)
- **Surface**: `#1e293b` (`--color-surface`)
- **Text**: `#f8fafc` (`--color-foreground`)

### Tailwind Klassen

```css
/* Verwendung der Theme-Farben */
bg-brand          /* Orange Hintergrund */
text-brand        /* Orange Text */
border-brand      /* Orange Border */
bg-surface        /* Dunkelblau Surface */
text-foreground   /* Haupttext */
text-text-muted   /* Gedämpfter Text */
```

## 🔐 Auth Flow

1. **Nicht eingeloggt**: Alle `/app/*` Routen → Redirect zu `/auth/login`
2. **Eingeloggt + `/`**: Redirect zu `/app`
3. **Middleware**: Überwacht alle Routen und setzt Cookies korrekt
4. **Server Components**: Verwenden `supabaseServer()` für SSR
5. **Client Components**: Verwenden `supabaseBrowser()` für Client-Side

### Supabase Helper

```javascript
// Server Components (nur lesen)
import { supabaseServer } from '@/lib/supabaseServer';
const supabase = await supabaseServer();

// Server Actions (Cookie-Management)
import { supabaseServerWithCookies } from '@/lib/supabaseServer';
const supabase = await supabaseServerWithCookies();

// Context-aware Client
import { getSupabaseClient } from '@/lib/supabaseServer';
const supabase = await getSupabaseClient('serverActions');
```

**Cookie-Sicherheit**: Automatische sichere Defaults (httpOnly, secure, sameSite: 'lax') in allen Kontexten.

## 📊 Datenbank-Schema

### Kern-Entitäten

- **profiles** - User-Profile
- **plans** - Trainingspläne  
- **sessions** - Trainingseinheiten
- **exercises** - Übungen (global + user-spezifisch)
- **session_exercises** - Übungen in Sessions
- **set_schemas** - Geplante Sätze
- **live_sessions** - Aktive Trainingseinheiten
- **set_logs** - Ausgeführte Sätze

### Row Level Security (RLS)

Alle Tabellen haben RLS aktiviert - User können nur ihre eigenen Daten sehen/bearbeiten.

## 🚀 Deployment

### Vercel (empfohlen)

**1. Vercel Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**2. Environment Variables in Vercel:**
```bash
# Required ENV Variables (set in Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Trainr App
```

**3. Supabase RLS/Policies Checklist:**
- ✅ Owner-basierte Policies aktiv
- ✅ `auth.users` RLS aktiviert
- ✅ Alle Tabellen haben RLS-Policies
- ✅ Service Key nur für Server-Side Operations

**4. Domain Setup:**
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Configure custom domain in Vercel (optional)
- Update Supabase Auth settings with production URL

### Alternative: Netlify, Railway, etc.

1. Verbinde Repository mit Vercel
2. Setze Umgebungsvariablen in Vercel Dashboard
3. Deploy automatisch bei Git Push

### Andere Plattformen

- **Railway**: `railway add` für Supabase Integration
- **Netlify**: Statische Generierung möglich
- **Docker**: `Dockerfile` verfügbar (geplant)

## 🧪 Testing

```bash
# E2E Tests (geplant)
bun test:e2e

# Unit Tests (geplant)  
bun test
```

## 📈 Roadmap

### Phase 1 (Aktuell)
- ✅ Auth & Basis-Setup
- ✅ Dashboard & Navigation
- ✅ Pläne & Sessions CRUD
- ✅ Live Training Interface

### Phase 2 (Geplant)
- 🔄 OSM Karten-Integration
- 🔄 GPS-Routen Tracking
- 🔄 Cardio Live-Training
- 🔄 Auto-Progression

### Phase 3 (Zukunft)
- 📅 Ernährung-Tracking
- 📅 Garmin/Strava Integration
- 📅 Kalender-Export
- 📅 Analytics Dashboard

## 🤝 Contributing

1. Fork das Repository
2. Erstelle Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit Changes (`git commit -m 'Add amazing feature'`)
4. Push Branch (`git push origin feature/amazing-feature`)
5. Öffne Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Docs**: [Wiki](https://github.com/your-repo/wiki)

## 🙏 Credits

- **Next.js** - React Framework
- **Supabase** - Backend-as-a-Service
- **Tailwind CSS** - Utility-first CSS
- **OpenStreetMap** - Karten-Daten