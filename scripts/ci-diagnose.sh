#!/usr/bin/env bash
set -euo pipefail
mkdir -p ops/LOGS
TS=$(date +"%Y%m%d-%H%M%S")
LOG="ops/LOGS/ci-diagnose-$TS.txt"

export NEXT_TELEMETRY_DISABLED=1
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://stub.supabase.co}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-stub}"
export SITE_URL="${SITE_URL:-http://localhost:3000}"

{
  echo "## CI Diagnose $TS"
  echo "Node: $(node -v)  NPM: $(npm -v)"
  echo
  echo "### Lint"
  npm run lint 2>&1 || true
  echo
  echo "### Build"
  npm run build 2>&1 || true
} | tee "$LOG" >/dev/null

echo -e "\n### [CI-DIAGNOSE] $TS\n" >> ops/OUTBOX.md
echo "- Log: $LOG" >> ops/OUTBOX.md
echo "\n\`\`\`\n$(tail -n 80 "$LOG")\n\`\`\`\n" >> ops/OUTBOX.md
