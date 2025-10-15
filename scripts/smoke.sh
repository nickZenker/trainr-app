#!/usr/bin/env bash
set -euo pipefail
echo "SMOKE: /api/health (optional), /app, /app/plans, /app/plans/new"
URL="${1:-http://localhost:3001}"
for path in /app /app/plans /app/plans/new ; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$path" || true)
  echo "$path -> $code"
done | tee -a ops/OUTBOX.md
