# API Dokumentation

## Übersicht

Die Trainings-App verwendet eine REST-ähnliche API mit Next.js API Routes. Alle Endpoints sind durch Supabase Auth geschützt und verwenden Row Level Security (RLS).

## Authentication

Alle API-Endpoints erfordern eine gültige Session. Der `Authorization` Header wird automatisch von Supabase Client gesetzt.

```javascript
// Automatisch gesetzt durch Supabase Client
headers: {
  'Authorization': 'Bearer <jwt-token>'
}
```

## Base URL

```
http://localhost:3001/api  // Development
https://your-app.vercel.app/api  // Production
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE (optional)"
}
```

## Endpoints

### Plans

#### GET /api/plans
Hole alle Trainingspläne des Users.

**Response:**
```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "Ganzkörper Kraftplan",
      "goal": "Muskelaufbau",
      "active": true,
      "archived_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/plans
Erstelle einen neuen Trainingsplan.

**Body:**
```json
{
  "name": "Neuer Plan",
  "goal": "Ziel des Plans"
}
```

**Response:**
```json
{
  "plan": {
    "id": "uuid",
    "name": "Neuer Plan",
    "goal": "Ziel des Plans",
    "active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/plans/[id]
Hole einen spezifischen Plan mit Sessions.

**Response:**
```json
{
  "plan": {
    "id": "uuid",
    "name": "Ganzkörper Kraftplan",
    "goal": "Muskelaufbau",
    "sessions": [
      {
        "id": "uuid",
        "name": "Oberkörper",
        "type": "strength",
        "weekday": 1,
        "time": "18:00:00",
        "order_index": 0
      }
    ]
  }
}
```

#### PUT /api/plans/[id]
Aktualisiere einen Plan.

**Body:**
```json
{
  "name": "Neuer Name",
  "goal": "Neues Ziel",
  "active": false,
  "archived_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /api/plans/[id]
Lösche einen Plan (und alle zugehörigen Sessions).

### Sessions

#### GET /api/sessions?plan_id=uuid
Hole alle Sessions eines Plans.

**Query Parameters:**
- `plan_id` (required): Plan UUID

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "name": "Oberkörper Training",
      "type": "strength",
      "weekday": 1,
      "time": "18:00:00",
      "session_exercises": [
        {
          "id": "uuid",
          "exercise_id": "uuid",
          "selected_variant": "barbell",
          "notes": "Warm-up wichtig",
          "order_index": 0,
          "exercises": {
            "id": "uuid",
            "name": "Bankdrücken",
            "muscle_primary": "chest",
            "equipment": ["barbell", "dumbbell"]
          }
        }
      ]
    }
  ]
}
```

#### POST /api/sessions
Erstelle eine neue Session.

**Body:**
```json
{
  "plan_id": "uuid",
  "type": "strength",
  "name": "Neue Session",
  "weekday": 1,
  "time": "18:00:00",
  "order_index": 0
}
```

### Exercises

#### GET /api/exercises
Hole alle verfügbaren Übungen (global + user-spezifisch).

**Query Parameters:**
- `muscle_group` (optional): Filter nach Muskelgruppe
- `equipment` (optional): Filter nach Equipment

**Response:**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "name": "Bankdrücken",
      "muscle_primary": "chest",
      "muscle_secondary": ["triceps", "shoulders"],
      "equipment": ["barbell", "dumbbell"],
      "favorite_variant": "barbell",
      "technique_notes": "Brust raus, Schulterblätter zusammenziehen",
      "exercise_variants": [
        {
          "id": "uuid",
          "variant": "barbell"
        },
        {
          "id": "uuid", 
          "variant": "dumbbell"
        }
      ]
    }
  ]
}
```

#### POST /api/exercises
Erstelle eine neue Übung.

**Body:**
```json
{
  "name": "Neue Übung",
  "muscle_primary": "chest",
  "muscle_secondary": ["triceps"],
  "equipment": ["barbell"],
  "favorite_variant": "barbell",
  "technique_notes": "Wichtige Hinweise",
  "variants": ["barbell", "dumbbell"]
}
```

### Routes

#### GET /api/routes
Hole alle GPS-Routen des Users.

**Query Parameters:**
- `surface` (optional): Filter nach Oberfläche
- `min_distance` (optional): Minimale Distanz in Metern
- `max_distance` (optional): Maximale Distanz in Metern

**Response:**
```json
{
  "routes": [
    {
      "id": "uuid",
      "name": "Stadtpark Runde",
      "surface": "asphalt",
      "distance_m": 5000,
      "climb_m": 50,
      "map_geojson": {
        "type": "LineString",
        "coordinates": [[10.0, 50.0], [10.01, 50.01]]
      },
      "gpx_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/routes
Erstelle eine neue Route.

**Body:**
```json
{
  "name": "Neue Route",
  "surface": "trail",
  "distance_m": 10000,
  "climb_m": 200,
  "map_geojson": {
    "type": "LineString",
    "coordinates": [[10.0, 50.0], [10.1, 50.1]]
  }
}
```

### Live Sessions

#### GET /api/live-sessions
Hole alle aktiven Live-Sessions des Users.

**Response:**
```json
{
  "liveSessions": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "type": "strength",
      "started_at": "2024-01-01T18:00:00Z",
      "status": "active",
      "sessions": {
        "id": "uuid",
        "name": "Oberkörper Training",
        "type": "strength"
      }
    }
  ]
}
```

#### POST /api/live-sessions
Starte eine neue Live-Session.

**Body:**
```json
{
  "session_id": "uuid",
  "type": "strength"
}
```

**Response:**
```json
{
  "liveSession": {
    "id": "uuid",
    "session_id": "uuid",
    "type": "strength",
    "status": "active",
    "started_at": "2024-01-01T18:00:00Z",
    "sessions": {
      "id": "uuid",
      "name": "Oberkörper Training",
      "type": "strength",
      "session_exercises": [
        {
          "id": "uuid",
          "exercises": {
            "name": "Bankdrücken"
          },
          "set_schemas": [
            {
              "set_index": 1,
              "planned_reps": 12,
              "planned_weight": 60.0,
              "rir_or_rpe": 8
            }
          ]
        }
      ]
    }
  }
}
```

#### GET /api/live-sessions/[id]
Hole eine spezifische Live-Session mit allen Daten.

**Response:**
```json
{
  "liveSession": {
    "id": "uuid",
    "session_id": "uuid",
    "type": "strength",
    "status": "active",
    "started_at": "2024-01-01T18:00:00Z",
    "sessions": { ... },
    "set_logs": [
      {
        "id": "uuid",
        "session_exercise_id": "uuid",
        "variant": "barbell",
        "set_index": 1,
        "actual_reps": 12,
        "actual_weight": 60.0,
        "rpe": 8,
        "notes": "Gut gefühlt",
        "auto_progression_applied": false,
        "created_at": "2024-01-01T18:05:00Z"
      }
    ],
    "cardio_logs": []
  }
}
```

#### PUT /api/live-sessions/[id]
Aktualisiere eine Live-Session (z.B. beenden).

**Body:**
```json
{
  "status": "completed",
  "finished_at": "2024-01-01T19:00:00Z",
  "duration_sec": 3600
}
```

## Error Codes

| Code | Status | Beschreibung |
|------|--------|--------------|
| 400 | Bad Request | Ungültige Anfrage-Parameter |
| 401 | Unauthorized | Nicht authentifiziert |
| 403 | Forbidden | Keine Berechtigung |
| 404 | Not Found | Ressource nicht gefunden |
| 500 | Internal Server Error | Server-Fehler |

## Rate Limiting

- Standard: 100 Requests pro Minute pro User
- Live Sessions: 1000 Requests pro Minute (höhere Frequenz beim Training)

## Webhooks

Webhooks sind für zukünftige Integrationen geplant:

- `session.completed` - Session beendet
- `goal.achieved` - Ziel erreicht
- `achievement.unlocked` - Erfolg freigeschaltet

## SDKs

### JavaScript/TypeScript

```javascript
import { supabaseClient } from '@/lib/supabaseClient';

const supabase = supabaseClient();

// Plans abrufen
const { data: plans } = await supabase
  .from('plans')
  .select('*');

// Session erstellen
const { data: session } = await supabase
  .from('sessions')
  .insert({
    plan_id: 'uuid',
    name: 'Neue Session',
    type: 'strength'
  })
  .select()
  .single();
```

## Changelog

### v1.0.0 (2024-01-01)
- Initiale API-Implementierung
- Plans, Sessions, Exercises CRUD
- Live Sessions für Training
- Routes für GPS-Tracking
- Row Level Security implementiert
