# ============================================================================
# AGENT PLATFORM 2.0 - VERCEL DEPLOYMENT SCRIPT (PowerShell)
# ============================================================================

$ErrorActionPreference = "Stop"VITE_SUPABASE_URL=https://dhirjmihiuwcibkxhucu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

Write-Host "🚀 AGENT PLATFORM 2.0 - VERCEL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

Write-Host "STEP 1: Checking Prerequisites" -ForegroundColor Blue

# Check Vercel CLI
try {
  $vercelVersion = vercel --version 2>&1
  Write-Host "✓ Vercel CLI installed: $vercelVersion" -ForegroundColor Green
} catch {
  Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
  Write-Host "Install with: npm install -g vercel" -ForegroundColor Yellow
  exit 1
}

# Check Node.js
try {
  $nodeVersion = node --version
  Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
  Write-Host "❌ Node.js not found" -ForegroundColor Red
  exit 1
}

# ============================================================================
# STEP 2: Navigate to Frontend Directory
# ============================================================================

Write-Host ""
Write-Host "STEP 2: Navigating to Frontend" -ForegroundColor Blue

$frontendPath = "frontend"

if (-not (Test-Path "$frontendPath\package.json")) {
  Write-Host "❌ frontend/package.json not found" -ForegroundColor Red
  exit 1
}

Set-Location $frontendPath
Write-Host "✓ Frontend directory ready" -ForegroundColor Green

# ============================================================================
# STEP 3: Install Dependencies
# ============================================================================

Write-Host ""
Write-Host "STEP 3: Installing Dependencies" -ForegroundColor Blue

if (Test-Path "node_modules") {
  Write-Host "✓ Dependencies already installed" -ForegroundColor Green
} else {
  Write-Host "Installing npm packages..." -ForegroundColor Yellow
  npm install --silent
  Write-Host "✓ Dependencies installed" -ForegroundColor Green
}

# ============================================================================
# STEP 4: Build Frontend
# ============================================================================

Write-Host ""
Write-Host "STEP 4: Building Frontend" -ForegroundColor Blue

npm run build 2>&1 | Select-Object -Last 10

if (Test-Path "dist") {
  Write-Host "✓ Build successful" -ForegroundColor Green
  Write-Host "  Build output: frontend/dist/" -ForegroundColor Gray

  # Show dist folder size
  $distSize = (Get-ChildItem -Recurse -Path dist | Measure-Object -Property Length -Sum).Sum / 1MB
  Write-Host "  Total size: $([Math]::Round($distSize, 2)) MB" -ForegroundColor Gray
} else {
  Write-Host "❌ Build failed" -ForegroundColor Red
  exit 1
}

# ============================================================================
# STEP 5: Deploy to Vercel
# ============================================================================

Write-Host ""
Write-Host "STEP 5: Deploying to Vercel" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  You'll be asked to authenticate with Vercel" -ForegroundColor Yellow
Write-Host "    If not logged in, a browser window will open" -ForegroundColor Yellow
Write-Host "    Login with your GitHub account" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press ENTER to continue..."
Read-Host

Write-Host "Deploying to production..." -ForegroundColor Cyan
vercel --prod --confirm

# ============================================================================
# STEP 6: Deployment Complete
# ============================================================================

Write-Host ""
Write-Host "STEP 6: Deployment Complete" -ForegroundColor Blue
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT SUCCESSFUL" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 7: Next Steps
# ============================================================================

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure Environment Variable:" -ForegroundColor White
Write-Host "   Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   Project: lilita-agent-platform" -ForegroundColor Cyan
Write-Host "   Settings → Environment Variables" -ForegroundColor Cyan
Write-Host "   Add: VITE_API_URL = https://your-railway-backend.railway.app" -ForegroundColor Cyan
Write-Host "   Redeploy from Deployments tab" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test Your Deployment:" -ForegroundColor White
Write-Host "   Open: https://lilita-agent-platform.vercel.app" -ForegroundColor Cyan
Write-Host "   Test signup flow" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Monitor Backend Connection:" -ForegroundColor White
Write-Host "   Open browser console (F12)" -ForegroundColor Cyan
Write-Host "   Check Network tab for API calls" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Run Integration Tests:" -ForegroundColor White
Write-Host "   See: INTEGRATION-TESTING.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# HELPFUL COMMANDS
# ============================================================================

Write-Host "Helpful Commands:" -ForegroundColor Blue
Write-Host ""
Write-Host "View deployments:" -ForegroundColor White
Write-Host "  vercel list" -ForegroundColor Gray
Write-Host ""
Write-Host "View logs:" -ForegroundColor White
Write-Host "  vercel logs" -ForegroundColor Gray
Write-Host ""
Write-Host "Redeploy from backup:" -ForegroundColor White
Write-Host "  vercel deploy --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "Local development:" -ForegroundColor White
Write-Host "  vercel dev" -ForegroundColor Gray
Write-Host ""
