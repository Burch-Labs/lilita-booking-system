#!/bin/bash

# ============================================================================
# LILITA KEPER - LAUNCH DAY SCRIPT
# Run this Friday to verify everything is ready before deploying
# ============================================================================

echo "🚀 LILITA KEPER LAUNCH DAY - PRE-DEPLOYMENT CHECKS"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# CHECK 1: Node.js & npm
# ============================================================================
echo "✓ Checking Node.js & npm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}  Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}  ERROR: Node.js not installed${NC}"
    exit 1
fi

# ============================================================================
# CHECK 2: Dependencies installed
# ============================================================================
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}  Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}  Installing backend dependencies...${NC}"
    npm install
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}  Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}  Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

# ============================================================================
# CHECK 3: Database connectivity
# ============================================================================
echo "✓ Checking database connection..."
if command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -d lilita_booking -c "SELECT COUNT(*) FROM offers;" &> /dev/null; then
        OFFER_COUNT=$(psql -h localhost -U postgres -d lilita_booking -t -c "SELECT COUNT(*) FROM offers;")
        echo -e "${GREEN}  Database connected - $OFFER_COUNT offers found${NC}"
    else
        echo -e "${YELLOW}  WARNING: Could not connect to database${NC}"
        echo "  You'll need to load offers-schema.sql in Railway PostgreSQL"
    fi
else
    echo -e "${YELLOW}  PostgreSQL client not installed (OK for Railway deployment)${NC}"
fi

# ============================================================================
# CHECK 4: Backend test
# ============================================================================
echo "✓ Testing backend API..."
BACKEND_URL="http://localhost:3002"

# Start backend in background
timeout 10 node server.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if curl -s "$BACKEND_URL/api/health" | grep -q "OK"; then
    echo -e "${GREEN}  Backend running ✓${NC}"
    
    OFFER_COUNT=$(curl -s "$BACKEND_URL/api/offers" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}  API endpoints working - $OFFER_COUNT offers loaded${NC}"
else
    echo -e "${RED}  ERROR: Backend not responding${NC}"
fi

# Kill background process
kill $BACKEND_PID 2>/dev/null

# ============================================================================
# CHECK 5: Frontend build
# ============================================================================
echo "✓ Testing frontend build..."
cd frontend
if npm run build &> /tmp/frontend-build.log; then
    echo -e "${GREEN}  Frontend builds successfully ✓${NC}"
else
    echo -e "${RED}  ERROR: Frontend build failed${NC}"
    cat /tmp/frontend-build.log
    exit 1
fi
cd ..

# ============================================================================
# CHECK 6: Configuration files
# ============================================================================
echo "✓ Checking deployment configs..."
if [ -f "railway.json" ]; then
    echo -e "${GREEN}  railway.json exists${NC}"
else
    echo -e "${RED}  ERROR: railway.json missing${NC}"
fi

if [ -f "frontend/vercel.json" ]; then
    echo -e "${GREEN}  vercel.json exists${NC}"
else
    echo -e "${RED}  ERROR: vercel.json missing${NC}"
fi

if [ -f ".env.example" ]; then
    echo -e "${GREEN}  .env.example exists${NC}"
else
    echo -e "${RED}  ERROR: .env.example missing${NC}"
fi

# ============================================================================
# CHECK 7: Git status
# ============================================================================
echo "✓ Checking git status..."
if git status &> /dev/null; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ $UNCOMMITTED -gt 0 ]; then
        echo -e "${YELLOW}  WARNING: $UNCOMMITTED uncommitted changes${NC}"
        echo "  Commit before deployment:"
        git status --short | head -5
    else
        echo -e "${GREEN}  All changes committed${NC}"
    fi
else
    echo -e "${YELLOW}  Not a git repository (OK if deploying from archive)${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "=================================================="
echo -e "${GREEN}✓ PRE-DEPLOYMENT CHECKS COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Commit any pending changes to git"
echo "2. Create Railway account: https://railway.app"
echo "3. Create Vercel account: https://vercel.com"
echo "4. Follow DEPLOYMENT.md for step-by-step instructions"
echo ""
echo "Estimated time to launch: 30 minutes"
echo "Your booking system will be live by 10:00 AM! 🎯"
echo ""
