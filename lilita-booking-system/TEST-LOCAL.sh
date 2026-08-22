#!/bin/bash

# ============================================================================
# AGENT PLATFORM 2.0 - LOCAL TEST RUNNER (Bash)
# ============================================================================

set -e

echo "🧪 AGENT PLATFORM 2.0 - LOCAL TEST SUITE"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

echo -e "${BLUE}STEP 1: Checking Prerequisites${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js installed${NC}"

# ============================================================================
# STEP 2: Start Backend Server
# ============================================================================

echo ""
echo -e "${BLUE}STEP 2: Starting Backend Server${NC}"

# Kill any existing process on port 3002
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
sleep 1

echo -e "${CYAN}Starting server on port 3002...${NC}"
node server.js > server.log 2> server-error.log &
SERVER_PID=$!

# Wait for server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
for i in {1..10}; do
  if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server running on port 3002${NC}"
    break
  fi
  sleep 1
  if [ $i -eq 10 ]; then
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "Check server.log for details"
    cat server-error.log
    exit 1
  fi
done

# ============================================================================
# STEP 3: Run Test Suite
# ============================================================================

echo ""
echo -e "${BLUE}STEP 3: Running Test Suite${NC}"
echo ""

node TEST-SUITE.js
TEST_RESULT=$?

# ============================================================================
# STEP 4: Cleanup
# ============================================================================

echo ""
echo -e "${BLUE}STEP 4: Cleaning Up${NC}"

echo -e "${YELLOW}Stopping backend server...${NC}"
kill $SERVER_PID 2>/dev/null || true
sleep 1

echo -e "${GREEN}✓ Server stopped${NC}"

# ============================================================================
# STEP 5: Results
# ============================================================================

echo ""

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  echo ""
  echo -e "${CYAN}Agent Platform 2.0 is ready for Vercel deployment!${NC}"
  echo ""
  echo -e "${YELLOW}Next step: ./DEPLOY-VERCEL.sh${NC}"
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo -e "${YELLOW}Please fix the issues above before deploying.${NC}"
  echo ""
  echo -e "${CYAN}Debug info:${NC}"
  echo "  Server logs: server.log"
  echo "  Error logs: server-error.log"
fi

echo ""
exit $TEST_RESULT
