#!/bin/bash

# ============================================================================
# AGENT PLATFORM 2.0 - VERCEL DEPLOYMENT SCRIPT
# ============================================================================

set -e

echo "🚀 AGENT PLATFORM 2.0 - VERCEL DEPLOYMENT"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

echo -e "${BLUE}STEP 1: Checking Prerequisites${NC}"

if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo "Install with: npm install -g vercel"
  exit 1
fi

echo -e "${GREEN}✓ Vercel CLI installed${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js installed${NC}"

# ============================================================================
# STEP 2: Navigate to Frontend Directory
# ============================================================================

echo ""
echo -e "${BLUE}STEP 2: Navigating to Frontend${NC}"

cd frontend

if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ frontend/package.json not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Frontend directory ready${NC}"

# ============================================================================
# STEP 3: Install Dependencies
# ============================================================================

echo ""
echo -e "${BLUE}STEP 3: Installing Dependencies${NC}"

if [ -d "node_modules" ]; then
  echo "✓ Dependencies already installed"
else
  echo "Installing npm packages..."
  npm install --silent
  echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# ============================================================================
# STEP 4: Build Frontend
# ============================================================================

echo ""
echo -e "${BLUE}STEP 4: Building Frontend${NC}"

npm run build 2>&1 | tail -10

if [ -d "dist" ]; then
  echo -e "${GREEN}✓ Build successful${NC}"
  echo "  Build output: frontend/dist/"
  ls -lh dist/ | head -5
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

# ============================================================================
# STEP 5: Deploy to Vercel
# ============================================================================

echo ""
echo -e "${BLUE}STEP 5: Deploying to Vercel${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next, you'll be asked to authenticate with Vercel${NC}"
echo "    If you're not logged in, this will open a browser window"
echo "    Login with your GitHub account"
echo ""
read -p "Press ENTER to continue..."

# Deploy to production
vercel --prod --confirm

# ============================================================================
# STEP 6: Get Deployment URL
# ============================================================================

echo ""
echo -e "${BLUE}STEP 6: Deployment Complete${NC}"

# Get the project info
VERCEL_DEPLOY_OUTPUT=$(vercel list --limit 1 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL${NC}"
echo ""
echo "=========================================="
echo "Frontend deployed to Vercel!"
echo "=========================================="
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. Configure Environment Variable:"
echo "   Go to: https://vercel.com/dashboard"
echo "   Project: lilita-agent-platform"
echo "   Settings → Environment Variables"
echo "   Add: VITE_API_URL = https://your-railway-backend.railway.app"
echo "   Redeploy from Deployments tab"
echo ""
echo "2. Test Your Deployment:"
echo "   Open: https://lilita-agent-platform.vercel.app"
echo "   Test signup flow"
echo ""
echo "3. Monitor Backend Connection:"
echo "   Open browser console (F12)"
echo "   Check Network tab for API calls"
echo ""
echo "4. Run Integration Tests:"
echo "   See: INTEGRATION-TESTING.md"
echo ""
echo "=========================================="
echo ""

# ============================================================================
# STEP 7: Display Helpful Information
# ============================================================================

echo -e "${BLUE}Helpful Commands:${NC}"
echo ""
echo "View deployments:"
echo "  vercel list"
echo ""
echo "View logs:"
echo "  vercel logs"
echo ""
echo "Redeploy from backup:"
echo "  vercel deploy --prod"
echo ""
echo "Local development:"
echo "  vercel dev"
echo ""
