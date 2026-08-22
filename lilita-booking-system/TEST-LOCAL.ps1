# ============================================================================
# AGENT PLATFORM 2.0 - LOCAL TEST RUNNER (PowerShell)
# ============================================================================

Write-Host "🧪 AGENT PLATFORM 2.0 - LOCAL TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

Write-Host "STEP 1: Checking Prerequisites" -ForegroundColor Blue

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Node.js not found" -ForegroundColor Red
  exit 1
}

Write-Host "✓ Node.js installed" -ForegroundColor Green

# ============================================================================
# STEP 2: Start Backend Server
# ============================================================================

Write-Host ""
Write-Host "STEP 2: Starting Backend Server" -ForegroundColor Blue

# Kill any existing process on port 3002
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*3002*" }
if ($existingProcess) {
  Write-Host "Stopping existing backend process..." -ForegroundColor Yellow
  Stop-Process -Id $existingProcess.Id -Force
  Start-Sleep -Seconds 1
}

Write-Host "Starting server on port 3002..." -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow -PassThru -RedirectStandardOutput "server.log" -RedirectStandardError "server-error.log"

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
$maxWait = 10
$elapsed = 0
$serverReady = $false

while ($elapsed -lt $maxWait) {
  Start-Sleep -Seconds 1
  $elapsed++

  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/health" -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
      $serverReady = $true
      break
    }
  } catch {
    # Server not ready yet
  }
}

if (-not $serverReady) {
  Write-Host "❌ Server failed to start" -ForegroundColor Red
  Write-Host "Check server.log for details" -ForegroundColor Yellow
  Get-Content "server-error.log" -ErrorAction SilentlyContinue | Write-Host -ForegroundColor Red
  exit 1
}

Write-Host "✓ Backend server running on port 3002" -ForegroundColor Green

# ============================================================================
# STEP 3: Run Test Suite
# ============================================================================

Write-Host ""
Write-Host "STEP 3: Running Test Suite" -ForegroundColor Blue
Write-Host ""

node TEST-SUITE.js
$testResult = $LASTEXITCODE

# ============================================================================
# STEP 4: Cleanup
# ============================================================================

Write-Host ""
Write-Host "STEP 4: Cleaning Up" -ForegroundColor Blue

Write-Host "Stopping backend server..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue

Write-Host "✓ Server stopped" -ForegroundColor Green

# ============================================================================
# STEP 5: Results
# ============================================================================

Write-Host ""

if ($testResult -eq 0) {
  Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
  Write-Host ""
  Write-Host "Agent Platform 2.0 is ready for Vercel deployment!" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Next step: .\DEPLOY-VERCEL.ps1" -ForegroundColor Yellow
} else {
  Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
  Write-Host ""
  Write-Host "Please fix the issues above before deploying." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Debug info:" -ForegroundColor Cyan
  Write-Host "  Server logs: server.log" -ForegroundColor Gray
  Write-Host "  Error logs: server-error.log" -ForegroundColor Gray
}

Write-Host ""
exit $testResult
