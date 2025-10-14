#!/usr/bin/env bash
set -euo pipefail
TS="$(date -u +%Y%m%d-%H%M%S)"
LOG="ops/LOGS/chaos-$TS.md"
echo "## Chaos-Matrix v1 ($TS UTC)" > "$LOG"
echo "- Node: $(node -v)" >> "$LOG"
echo "- PWD : $(pwd)" >> "$LOG"
echo "- Env  : NEXT_PUBLIC_SUPABASE_URL=$( [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && echo set || echo missing ), NEXT_PUBLIC_SUPABASE_ANON_KEY=$( [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && echo set || echo missing ), SUPABASE_SERVICE_KEY=$( [ -n "$SUPABASE_SERVICE_KEY" ] && echo set || echo missing )" >> "$LOG"
echo "" >> "$LOG"

function hit() {
  local path="$1"
  echo "### GET $path" >> "$LOG"
  set +e
  RES="$(curl -s -S -w '\n%{http_code}\n' "http://localhost:3001$path")"
  CODE="$(echo "$RES" | tail -n1)"
  BODY="$(echo "$RES" | sed '$d' | head -c 2000)"
  set -e
  echo "- code: $CODE" >> "$LOG"
  echo "- body (first 2k):" >> "$LOG"
  echo '```' >> "$LOG"
  echo "$BODY" >> "$LOG"
  echo '```' >> "$LOG"
  echo "" >> "$LOG"
}

# Server sollte laufen. Falls nicht, abbrechen mit Hinweis.
if ! curl -s "http://localhost:3001/api/health" >/dev/null; then
  echo "WARN: Dev-Server scheint nicht zu laufen. Bitte 'PORT=3001 npm run dev' starten." >> "$LOG"
  exit 0
fi

# Basistests
hit "/api/health"
hit "/app"
hit "/app/plans"
hit "/app/sessions"
hit "/app/calendar?view=month"
# Live: nur read-only page ([id] hier als Dummy 1 – Fehler wird protokolliert, ist okay)
hit "/app/live/1"

# Optional: 3x hintereinander, um Flaky-Verhalten zu erfassen
hit "/app/plans"
hit "/app/plans"
hit "/app/plans"

echo "Done." >> "$LOG"
echo "$LOG"
