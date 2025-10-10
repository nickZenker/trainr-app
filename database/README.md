# Database Schema & Migrations

Dieses Verzeichnis enthält die SQL-Migrationen und Seeds für die Trainings-App.

## Struktur

```
database/
├── migrations/
│   ├── 001_initial_schema.sql    # Alle Tabellen und Indizes
│   └── 002_rls_policies.sql      # Row Level Security Policies
├── seeds/
│   └── demo_data.sql             # Demo-Daten für Entwicklung
└── README.md                     # Diese Datei
```

## Setup in Supabase

### 1. Migrations ausführen

Führe die SQL-Dateien in dieser Reihenfolge in der Supabase SQL Console aus:

1. `001_initial_schema.sql` - Erstellt alle Tabellen, Indizes und aktiviert RLS
2. `002_rls_policies.sql` - Setzt alle RLS-Policies für Datenschutz

### 2. Demo-Daten laden

**Wichtig:** Vor dem Ausführen von `demo_data.sql` musst du:

1. Ein Demo-User in Supabase Auth erstellen (oder deine eigene User-ID verwenden)
2. Die UUID in `demo_data.sql` ersetzen:
   - `demo-user-uuid` → deine echte User-ID
   - `demo-plan-uuid` → neue UUID für den Plan
   - `demo-session-*-uuid` → neue UUIDs für Sessions
   - etc.

### 3. Automatisierung (Optional)

Du kannst auch ein Script erstellen, das die User-ID automatisch ersetzt:

```bash
# Beispiel-Script (adjust as needed)
USER_ID=$(supabase auth users list --format json | jq -r '.[0].id')
sed "s/demo-user-uuid/$USER_ID/g" database/seeds/demo_data.sql > temp_seed.sql
# Dann temp_seed.sql in Supabase ausführen
```

## Schema-Übersicht

### Kern-Tabellen

- **profiles** - User-Profile (erweitert auth.users)
- **plans** - Trainingspläne
- **sessions** - Einzelne Trainingseinheiten
- **exercises** - Übungen (global + user-spezifisch)
- **exercise_variants** - Varianten von Übungen (Barbell, Dumbbell, etc.)
- **session_exercises** - Übungen in einer Session
- **set_schemas** - Geplante Sätze mit Gewicht/Reps
- **live_sessions** - Aktive Trainingseinheiten
- **set_logs** - Tatsächlich ausgeführte Sätze

### Cardio & Routen

- **cardio_targets** - Cardio-Ziele (Zeit, Distanz, HR-Zone)
- **cardio_logs** - Cardio-Performance
- **routes** - Lauf-/Radstrecken mit GeoJSON

### Tracking & Analytics

- **body_metrics** - Körpermaße und Gewicht
- **goals** - Trainingsziele
- **achievements** - Erfolge/Badges
- **progression_cycles** - Auto-Progression Regeln

### Integration & Ernährung

- **integrations** - OAuth-Tokens (Garmin, Strava, etc.)
- **nutrition_foods** - Lebensmittel-Datenbank
- **nutrition_logs** - Ernährungs-Tracking
- **calendar_items** - Kalender-Integration

### System

- **sync_jobs** - Hintergrund-Sync-Jobs
- **feedback** - User-Feedback

## RLS (Row Level Security)

Alle Tabellen haben RLS aktiviert mit Policies, die sicherstellen:

- User können nur ihre eigenen Daten sehen/bearbeiten
- Globale Übungen sind für alle sichtbar
- User-spezifische Übungen sind privat
- Feedback kann jeder einreichen

## Indizes

Performance-Indizes sind auf häufig abgefragte Spalten gesetzt:
- `user_id` auf allen User-Tabellen
- `date` auf Logs und Metrics
- `start_ts` auf Calendar Items

## Nächste Schritte

Nach dem Schema-Setup:

1. API-Routen in `/src/app/api/` erstellen
2. Frontend-Komponenten mit echten Daten verbinden
3. Seed-Script für Produktions-Daten anpassen
4. Backup-Strategie einrichten
