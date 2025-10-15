# ADR-0001: Backend-Zugriff über Server Actions statt REST

## Status
Akzeptiert

## Kontext
Die Anwendung benötigt Backend-Zugriff für CRUD-Operationen auf Plans, Sessions, Exercises und Routes. Es gibt zwei Hauptansätze:
1. REST API mit `/api/*` Endpunkten
2. Server Actions mit direkten Supabase-Zugriffen

## Entscheidung
**Primär Server Actions + direkte Supabase-Zugriffe; keine REST außer `/api/health`**

## Begründung
- **Geschwindigkeit**: Weniger HTTP-Overhead, direkte DB-Verbindung
- **Geringere Komplexität**: Keine API-Route-Wartung, weniger Boilerplate
- **RLS nutzt DB am nächsten**: Row Level Security funktioniert optimal mit direkten DB-Zugriffen
- **Next.js Optimierung**: Server Actions sind First-Class-Citizen in Next.js 15

## Wann REST bauen
- Externe Clients (Mobile Apps, Third-Party)
- Webhooks und Integrationen
- API-Versionierung erforderlich
- Rate-Limits und komplexe Auth-Flows
- OpenAPI-Dokumentation benötigt

## Konsequenzen
- **Positiv**: Weniger Wartung, klarere Extension-Points, bessere Performance
- **Negativ**: Keine externe API verfügbar, schwieriger zu testen
- **Zukunft**: Später `/api/v1` mit OpenAPI bei Bedarf

## Implementierung
- Server Actions in Page-Komponenten
- Dünne Service-Schicht für Wiederverwendbarkeit
- Health-Endpoint für Monitoring

