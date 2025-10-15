# PowerShell version of chaos-matrix v1
$TS = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
$LOG = "ops/LOGS/chaos-$TS.md"

# Create log file
@"
## Chaos-Matrix v1 ($TS UTC)
- Node: $(node -v)
- PWD : $(Get-Location)
- Env  : NEXT_PUBLIC_SUPABASE_URL=$( if ($env:NEXT_PUBLIC_SUPABASE_URL) { "set" } else { "missing" } ), NEXT_PUBLIC_SUPABASE_ANON_KEY=$( if ($env:NEXT_PUBLIC_SUPABASE_ANON_KEY) { "set" } else { "missing" } ), SUPABASE_SERVICE_KEY=$( if ($env:SUPABASE_SERVICE_KEY) { "set" } else { "missing" } )

"@ | Out-File -FilePath $LOG -Encoding UTF8

function Test-Endpoint {
    param($Path)
    
    Write-Host "Testing: $Path"
    
    $url = "http://localhost:3001$Path"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $code = $response.StatusCode
        $body = $response.Content.Substring(0, [Math]::Min(2000, $response.Content.Length))
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $body = $_.Exception.Message
    }
    
    @"

### GET $Path
- code: $code
- body (first 2k):
```
$body
```

"@ | Out-File -FilePath $LOG -Append -Encoding UTF8
}

# Test if server is running
try {
    $healthTest = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Server is running, starting tests..."
} catch {
    @"

WARN: Dev-Server scheint nicht zu laufen. Bitte Dev-Server starten.

"@ | Out-File -FilePath $LOG -Append -Encoding UTF8
    Write-Host "Server not running. Please start with: `$env:PORT = '3001'; npm run dev"
    exit 0
}

# Run tests
Test-Endpoint "/api/health"
Test-Endpoint "/app"
Test-Endpoint "/app/plans"
Test-Endpoint "/app/sessions"
Test-Endpoint "/app/calendar?view=month"
Test-Endpoint "/app/live/1"

# Repeat tests to catch flaky behavior
Test-Endpoint "/app/plans"
Test-Endpoint "/app/plans"
Test-Endpoint "/app/plans"

"Done." | Out-File -FilePath $LOG -Append -Encoding UTF8
Write-Host "Chaos test completed. Log saved to: $LOG"
$LOG

