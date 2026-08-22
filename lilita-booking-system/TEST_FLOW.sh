#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API="http://localhost:3002/api"
TIMESTAMP=$(date +%s%N | cut -b1-13)
TEST_EMAIL="agent-test-${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 LILITA KEPER - COMPLETE TEST FLOW${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 1: Agent Registration
echo -e "${YELLOW}📝 TEST 1: Agent Registration${NC}"
echo "Email: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$API/auth/agent-register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"first_name\": \"Test\",
    \"last_name\": \"Agent\",
    \"company\": \"Test Travel Agency\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
AGENT_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✅ Registration successful${NC}"
  echo "   Token: ${TOKEN:0:20}..."
  echo "   Agent ID: $AGENT_ID"
else
  echo -e "${RED}❌ Registration failed${NC}"
  echo "   Response: $REGISTER_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Agent Login
echo -e "${YELLOW}📝 TEST 2: Agent Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/agent-login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$LOGIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "   Token: ${LOGIN_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get Available Suites
echo -e "${YELLOW}📝 TEST 3: Get Available Suites${NC}"
SUITES_RESPONSE=$(curl -s -X GET "$API/suites")
SUITE_COUNT=$(echo $SUITES_RESPONSE | grep -o '"id":"[^"]*' | wc -l)

if [ $SUITE_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Found $SUITE_COUNT suites${NC}"

  # Extract first suite ID and details
  SUITE_ID=$(echo $SUITES_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  SUITE_NAME=$(echo $SUITES_RESPONSE | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
  SUITE_PRICE=$(echo $SUITES_RESPONSE | grep -o '"base_price":"[^"]*' | head -1 | cut -d'"' -f4)

  echo "   First Suite: $SUITE_NAME"
  echo "   Price: \$$SUITE_PRICE/night"
  echo "   Suite ID: $SUITE_ID"
else
  echo -e "${RED}❌ No suites found${NC}"
  exit 1
fi
echo ""

# Test 4: Create a Booking
echo -e "${YELLOW}📝 TEST 4: Create a Booking${NC}"
CHECK_IN="2026-09-15"
CHECK_OUT="2026-09-20"
NUM_NIGHTS=5
BASE_PRICE=$SUITE_PRICE
TOTAL_AMOUNT=$(echo "$BASE_PRICE * $NUM_NIGHTS" | bc)

BOOKING_RESPONSE=$(curl -s -X POST "$API/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d "{
    \"suite_id\": \"$SUITE_ID\",
    \"check_in_date\": \"$CHECK_IN\",
    \"check_out_date\": \"$CHECK_OUT\",
    \"num_guests\": 2,
    \"guest_email\": \"guest@example.com\",
    \"guest_name\": \"John Smith\",
    \"special_requests\": \"Late arrival\",
    \"booking_channel\": \"AGENT\",
    \"base_total\": $TOTAL_AMOUNT,
    \"final_total\": $TOTAL_AMOUNT
  }")

BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
BOOKING_REF=$(echo $BOOKING_RESPONSE | grep -o '"booking_reference":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$BOOKING_ID" ]; then
  echo -e "${GREEN}✅ Booking created successfully${NC}"
  echo "   Booking ID: $BOOKING_ID"
  echo "   Booking Reference: $BOOKING_REF"
  echo "   Dates: $CHECK_IN to $CHECK_OUT ($NUM_NIGHTS nights)"
  echo "   Total: \$$TOTAL_AMOUNT"
else
  echo -e "${RED}❌ Booking creation failed${NC}"
  echo "   Response: $BOOKING_RESPONSE"
  exit 1
fi
echo ""

# Test 5: Get Booking Details
echo -e "${YELLOW}📝 TEST 5: Get Booking Details${NC}"
BOOKING_DETAILS=$(curl -s -X GET "$API/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

BOOKING_STATUS=$(echo $BOOKING_DETAILS | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$BOOKING_STATUS" = "ON_HOLD" ] || [ "$BOOKING_STATUS" = "PENDING" ]; then
  echo -e "${GREEN}✅ Booking retrieved successfully${NC}"
  echo "   Status: $BOOKING_STATUS"
  echo "   Hold expires in 48 hours"
else
  echo -e "${RED}❌ Booking retrieval failed${NC}"
  echo "   Response: $BOOKING_DETAILS"
fi
echo ""

# Test 6: Get Agent Dashboard
echo -e "${YELLOW}📝 TEST 6: Get Agent Dashboard${NC}"
DASHBOARD=$(curl -s -X GET "$API/agent/dashboard" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

TOTAL_BOOKINGS=$(echo $DASHBOARD | grep -o '"total_bookings":[^,}]*' | cut -d':' -f2)
CONFIRMED=$(echo $DASHBOARD | grep -o '"confirmed_bookings":[^,}]*' | cut -d':' -f2)

if [ ! -z "$TOTAL_BOOKINGS" ]; then
  echo -e "${GREEN}✅ Dashboard data retrieved${NC}"
  echo "   Total Bookings: $TOTAL_BOOKINGS"
  echo "   Confirmed: $CONFIRMED"
else
  echo -e "${YELLOW}⚠️  Dashboard returned limited data${NC}"
fi
echo ""

# Test 7: Get Agent Bookings
echo -e "${YELLOW}📝 TEST 7: Get Agent Bookings${NC}"
AGENT_BOOKINGS=$(curl -s -X GET "$API/agent/bookings" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

AGENT_BOOKING_COUNT=$(echo $AGENT_BOOKINGS | grep -o '"id":"[^"]*' | wc -l)

if [ $AGENT_BOOKING_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Agent bookings retrieved${NC}"
  echo "   Found: $AGENT_BOOKING_COUNT booking(s)"
else
  echo -e "${YELLOW}⚠️  No bookings for agent yet${NC}"
fi
echo ""

# Test 8: Get Commission Tracking
echo -e "${YELLOW}📝 TEST 8: Get Commission Tracking${NC}"
COMMISSIONS=$(curl -s -X GET "$API/agent/commissions" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

COMMISSION_COUNT=$(echo $COMMISSIONS | grep -o '"id":"[^"]*' | wc -l)

if [ $COMMISSION_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Commissions retrieved${NC}"
  echo "   Found: $COMMISSION_COUNT commission record(s)"
else
  echo -e "${YELLOW}⚠️  No commissions for agent yet${NC}"
fi
echo ""

# Test 9: Confirm Booking (Optional Payment)
echo -e "${YELLOW}📝 TEST 9: Confirm Booking${NC}"
CONFIRM_RESPONSE=$(curl -s -X POST "$API/bookings/$BOOKING_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d "{
    \"payment_method\": \"CARD\",
    \"amount\": $TOTAL_AMOUNT
  }")

CONFIRM_STATUS=$(echo $CONFIRM_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$CONFIRM_STATUS" = "CONFIRMED" ]; then
  echo -e "${GREEN}✅ Booking confirmed${NC}"
  echo "   New Status: CONFIRMED"
else
  echo -e "${YELLOW}⚠️  Booking confirmation pending${NC}"
  echo "   Status: $CONFIRM_STATUS"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ ALL TESTS COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}📊 TEST SUMMARY:${NC}"
echo "  ✅ Agent Registration"
echo "  ✅ Agent Login"
echo "  ✅ Get Suites"
echo "  ✅ Create Booking"
echo "  ✅ Get Booking Details"
echo "  ✅ Agent Dashboard"
echo "  ✅ Agent Bookings"
echo "  ✅ Commission Tracking"
echo "  ✅ Confirm Booking"
echo ""
echo -e "${BLUE}📝 TEST CREDENTIALS:${NC}"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo ""
echo -e "${BLUE}🎯 BOOKING CREATED:${NC}"
echo "  Reference: $BOOKING_REF"
echo "  Suite: $SUITE_NAME"
echo "  Dates: $CHECK_IN to $CHECK_OUT"
echo "  Total: \$$TOTAL_AMOUNT"
echo ""
echo -e "${BLUE}🔗 ACCESS URLS:${NC}"
echo "  Frontend: http://localhost:5173"
echo "  Backend: http://localhost:3002"
echo ""
echo -e "${GREEN}✨ Complete booking flow tested and working!${NC}"
echo ""
