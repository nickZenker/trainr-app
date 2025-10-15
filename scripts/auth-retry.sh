#!/usr/bin/env bash
set -euo pipefail
INTERVAL="${INTERVAL:-30}"   # Sekunden
LIMIT="${LIMIT:-40}"         # max Versuche (≈ 20 Min)
BASE="${BASE_URL:-http://localhost:3001}"
TS="$(date -u +%Y%m%d-%H%M%S)"
LOG="ops/LOGS/auth-retry-$TS.md"
echo "## Auth Retry ($TS UTC)" > "$LOG"
echo "- Base: $BASE" >> "$LOG"
echo "- Interval: ${INTERVAL}s, Limit: $LIMIT" >> "$LOG"
echo "" >> "$LOG"
i=0
while [ $i -lt $LIMIT ]; do
  i=$((i+1))
  echo "### Attempt $i" >> "$LOG"
  # Kurzer Vorcheck
  AUTHJSON="$(curl -sS "$BASE/api/auth-check" || true)"
  echo "- auth-check: $(echo "$AUTHJSON" | tr -d '\n' | cut -c1-200)" >> "$LOG"
  # Nur Auth-Spec laufen lassen
  npx playwright test tests/e2e/auth.spec.js --reporter=list > /tmp/auth-retry.out 2>&1 || true
  echo '```' >> "$LOG"
  tail -n 50 /tmp/auth-retry.out >> "$LOG"
  echo '```' >> "$LOG"
  if grep -q "1 passed" /tmp/auth-retry.out; then
    echo "- RESULT: PASS ✅" >> "$LOG"
    # OUTBOX-Update
    {
      echo "### [AUTH-RETRY] Login grün ($TS)"
      echo "- Versuch: $i"
      echo "- Ergebnis: PASS"
      echo "- Hinweis: Supabase Redirects sind korrekt konfiguriert."
    } >> ops/OUTBOX.md
    echo "$LOG"
    exit 0
  else
    echo "- RESULT: still failing ⏳" >> "$LOG"
    sleep "$INTERVAL"
  fi
done
echo "- RESULT: TIMEOUT ❌ (Auth weiterhin FAIL)" >> "$LOG"
{
  echo "### [AUTH-RETRY] Timeout ($TS)"
  echo "- Ergebnis: weiterhin FAIL"
  echo "- Bitte Supabase Dashboard gemäß docs/AUTH_FIX.md prüfen:"
  echo "  • Site URL: http://localhost:3001"
  echo "  • Redirect: http://localhost:3001/auth/callback"
} >> ops/OUTBOX.md
echo "$LOG"
