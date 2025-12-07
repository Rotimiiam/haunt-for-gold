#!/bin/bash

# Test script for Analytics Service API
# Make sure the analytics service is running before executing this script

BASE_URL="http://localhost:3002"
SESSION_ID="test-session-$(date +%s)"
GAME_ID="test-game-$(date +%s)"

echo "================================"
echo "Analytics Service API Test"
echo "================================"
echo ""
echo "Using Session ID: $SESSION_ID"
echo "Using Game ID: $GAME_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API call and display result
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "${BLUE}Testing: ${description}${NC}"
  echo "Endpoint: $method $endpoint"
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
  else
    echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    echo "$body"
  fi
  
  echo ""
  echo "-----------------------------------"
  echo ""
}

# 1. Health check
test_endpoint "GET" "/health" "" "Health Check"

# 2. Track a visit
test_endpoint "POST" "/api/analytics/visit" \
  "{\"sessionId\":\"$SESSION_ID\",\"page\":\"home\",\"userAgent\":\"Test-Script/1.0\"}" \
  "Track Visit Event"

# 3. Track page view
test_endpoint "POST" "/api/analytics/pageview" \
  "{\"sessionId\":\"$SESSION_ID\",\"page\":\"home\",\"path\":\"/\",\"timeOnPage\":30}" \
  "Track Page View"

# 4. Start a practice game
test_endpoint "POST" "/api/analytics/game/start" \
  "{\"sessionId\":\"$SESSION_ID\",\"gameMode\":\"practice\",\"gameId\":\"$GAME_ID\"}" \
  "Start Practice Game"

# Wait a moment to simulate game duration
echo "Waiting 3 seconds to simulate game duration..."
sleep 3
echo ""

# 5. End the game
test_endpoint "POST" "/api/analytics/game/end" \
  "{\"sessionId\":\"$SESSION_ID\",\"gameId\":\"$GAME_ID\",\"completed\":true,\"score\":500,\"result\":\"win\"}" \
  "End Game (Win)"

# 6. Start an online game
ONLINE_GAME_ID="online-game-$(date +%s)"
test_endpoint "POST" "/api/analytics/game/start" \
  "{\"sessionId\":\"$SESSION_ID\",\"gameMode\":\"online\",\"gameId\":\"$ONLINE_GAME_ID\"}" \
  "Start Online Game"

sleep 2

# 7. End online game
test_endpoint "POST" "/api/analytics/game/end" \
  "{\"sessionId\":\"$SESSION_ID\",\"gameId\":\"$ONLINE_GAME_ID\",\"completed\":true,\"score\":350,\"result\":\"lose\"}" \
  "End Online Game (Lose)"

# 8. Start a local game
LOCAL_GAME_ID="local-game-$(date +%s)"
test_endpoint "POST" "/api/analytics/game/start" \
  "{\"sessionId\":\"$SESSION_ID\",\"gameMode\":\"local\",\"gameId\":\"$LOCAL_GAME_ID\"}" \
  "Start Local Game"

# 9. Abandon the local game
test_endpoint "POST" "/api/analytics/game/end" \
  "{\"sessionId\":\"$SESSION_ID\",\"gameId\":\"$LOCAL_GAME_ID\",\"completed\":false,\"result\":\"abandoned\"}" \
  "End Local Game (Abandoned)"

# Query endpoints
echo ""
echo "================================"
echo "Querying Analytics Data"
echo "================================"
echo ""

# 10. Get total visits
test_endpoint "GET" "/api/analytics/visits/total" "" "Get Total Visits"

# 11. Get game mode statistics
test_endpoint "GET" "/api/analytics/games/modes" "" "Get Game Mode Statistics"

# 12. Get active sessions
test_endpoint "GET" "/api/analytics/sessions/active" "" "Get Active Sessions"

# 13. Get completion rates
test_endpoint "GET" "/api/analytics/games/completion" "" "Get Game Completion Rates"

# 14. Get page views
test_endpoint "GET" "/api/analytics/pageviews" "" "Get Page View Statistics"

# 15. Get engagement metrics
test_endpoint "GET" "/api/analytics/engagement" "" "Get Engagement Metrics"

# 16. Get peak usage times
test_endpoint "GET" "/api/analytics/peak-usage" "" "Get Peak Usage Times"

# 17. Get comprehensive dashboard
test_endpoint "GET" "/api/analytics/dashboard" "" "Get Dashboard Data"

# 18. End session
test_endpoint "POST" "/api/analytics/session/end" \
  "{\"sessionId\":\"$SESSION_ID\"}" \
  "End User Session"

echo ""
echo "================================"
echo "Test Complete!"
echo "================================"
echo ""
echo "The analytics database should now contain test data."
echo "You can query the endpoints again to see the recorded data."
