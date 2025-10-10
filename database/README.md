# Database Schema & Migrations

Dieses Verzeichnis enthält die SQL-Migrationen und Seeds für die Trainings-App.

## Struktur

```
database/
├── migrations/
│   ├── 001_initial_schema.sql    # Alle Tabellen und Indizes
│   ├── 002_rls_policies.sql      # Row Level Security Policies
│   └── 003_analytics_and_webhooks.sql  # Analytics Views & Webhook Events
├── seeds/
│   └── demo_data.sql             # Demo-Daten für Entwicklung
└── README.md                     # Diese Datei
```

## Setup in Supabase

### 1. Migrations ausführen

Führe die SQL-Dateien in dieser Reihenfolge in der Supabase SQL Console aus:

1. `001_initial_schema.sql` - Erstellt alle Tabellen, Indizes und aktiviert RLS
2. `002_rls_policies.sql` - Setzt alle RLS-Policies für Datenschutz
3. `003_analytics_and_webhooks.sql` - Analytics Views, Webhook Events und Helper-Functions

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

### System & Analytics

- **sync_jobs** - Hintergrund-Sync-Jobs
- **webhook_events** - Externe Service-Webhooks (Garmin, Strava, etc.)
- **feedback** - User-Feedback
- **muscle_volume_agg** - Materialized View für Muskelgruppen-Analyse

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

## Analytics & Materialized Views

### muscle_volume_agg

Die Materialized View `muscle_volume_agg` aggregiert Trainingsvolumen nach Muskelgruppen:

```sql
-- Manuelle Aktualisierung (nach neuen Trainings)
SELECT refresh_muscle_volume_agg();

-- Muskelgruppen-Status abfragen
SELECT get_muscle_group_status('user-uuid', 'chest'); -- 'optimal', 'under', 'over', 'untrained'

-- Training-Streak abfragen
SELECT get_training_streak('user-uuid'); -- Anzahl Tage
```

**Wichtig:** Die View sollte regelmäßig aktualisiert werden (z.B. täglich via Cron).

### Webhook Events

Die `webhook_events` Tabelle trackt externe Service-Events:

- **Provider**: Garmin, Strava, Apple Health, etc.
- **Event Types**: activity.created, activity.updated, user.signup
- **Status**: received, processing, processed, failed, ignored
- **Deduplication**: Über `provider` + `event_id`

## Nächste Schritte

Nach dem Schema-Setup:

1. API-Routen in `/src/app/api/` erstellen
2. Frontend-Komponenten mit echten Daten verbinden
3. Seed-Script für Produktions-Daten anpassen
4. Backup-Strategie einrichten
5. Cron-Jobs für Materialized View Refresh einrichten

