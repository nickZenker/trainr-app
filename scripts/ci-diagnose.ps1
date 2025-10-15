# PowerShell CI Diagnose Script
$ErrorActionPreference = "Continue"
$TS = Get-Date -Format "yyyyMMdd-HHmmss"
$LOG = "ops/LOGS/ci-diagnose-$TS.txt"

# Ensure logs directory exists
if (!(Test-Path "ops/LOGS")) {
    New-Item -ItemType Directory -Path "ops/LOGS" -Force
}

# Set environment variables
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_PUBLIC_SUPABASE_URL = if ($env:NEXT_PUBLIC_SUPABASE_URL) { $env:NEXT_PUBLIC_SUPABASE_URL } else { "https://stub.supabase.co" }
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = if ($env:NEXT_PUBLIC_SUPABASE_ANON_KEY) { $env:NEXT_PUBLIC_SUPABASE_ANON_KEY } else { "stub" }
$env:SITE_URL = if ($env:SITE_URL) { $env:SITE_URL } else { "http://localhost:3000" }

# Run diagnosis
$output = @()
$output += "## CI Diagnose $TS"
$output += "Node: $(node -v)  NPM: $(npm -v)"
$output += ""
$output += "### Lint"
try {
    $lintOutput = npm run lint 2>&1
    $output += $lintOutput
} catch {
    $output += "Lint failed: $($_.Exception.Message)"
}
$output += ""
$output += "### Build"
try {
    $buildOutput = npm run build 2>&1
    $output += $buildOutput
} catch {
    $output += "Build failed: $($_.Exception.Message)"
}

# Write to log file
$output | Out-File -FilePath $LOG -Encoding UTF8

# Append to OUTBOX
$outboxContent = @"

### [CI-DIAGNOSE] $TS

- Log: $LOG

``````
$($output[-80..-1] -join "`n")
``````
"@

Add-Content -Path "ops/OUTBOX.md" -Value $outboxContent

Write-Host "CI diagnosis completed. Log: $LOG"
