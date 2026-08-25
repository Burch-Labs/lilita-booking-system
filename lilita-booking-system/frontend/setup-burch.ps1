# ============================================
# BURCH SETUP SCRIPT - Option B Complete
# Automates: .env.local, npm install, dev server
# ============================================

Write-Host "`n[BURCH SETUP] Starting..." -ForegroundColor Cyan

# Step 1: Verify we're in the right directory
$currentDir = Get-Location
$frontendPath = "C:\Users\HP\contacts-app\lilita-booking-system\frontend"

if ($currentDir.Path -ne $frontendPath) {
    Write-Host "[INFO] Changing to frontend directory..." -ForegroundColor Yellow
    Set-Location $frontendPath
}

# Step 2: Create .env.local
Write-Host "`n[STEP 1] Creating .env.local..." -ForegroundColor Cyan

$envContent = @"
VITE_SUPABASE_URL=https://dhirjmihiuwcibkxhucu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaXJqbWloaXV3Y2lia3hodWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODgwOTcsImV4cCI6MjEwMzE2NDA5N30.fFlJUetgWfpEjblP_QpH3Zw8odsoKvLJ80wm9ISK7-k
"@

# Verify .env.local doesn't exist or overwrite it
if (Test-Path ".env.local") {
    Remove-Item ".env.local" -Force
    Write-Host "[OK] Old .env.local removed" -ForegroundColor Green
}

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "[OK] .env.local created successfully" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host "`n[STEP 2] Installing npm dependencies..." -ForegroundColor Cyan
Write-Host "This may take 2-3 minutes..." -ForegroundColor Yellow

npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm install failed" -ForegroundColor Red
    exit 1
}

# Step 4: Clear cache (optional but helpful)
Write-Host "`n[STEP 3] Clearing build cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.vite") {
    Remove-Item "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Cache cleared" -ForegroundColor Green
}

# Step 5: Start dev server
Write-Host "`n[STEP 4] Starting Burch development server..." -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan
Write-Host "Local:   http://localhost:5173/" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan
Write-Host "`n[SETUP COMPLETE]" -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host "Login: test@burch.app" -ForegroundColor Yellow
Write-Host "Password: test" -ForegroundColor Yellow
Write-Host "`n" -ForegroundColor Cyan

npm run dev
