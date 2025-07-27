#!/bin/bash

# Integration Test Script for Internet Clock Online
set -e

echo "Running Integration Tests for Internet Clock Online"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Check if package.json exists and is valid
run_test "package.json validity" "test -f package.json && node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'"

# Test 2: Check if main HTML file exists
run_test "Main HTML file exists" "test -f Index.html || test -f index.html"

# Test 3: Check if required directories exist
run_test "Required directories exist" "test -d styles && test -d scripts"

# Test 4: Check if main CSS file exists
run_test "Main CSS file exists" "test -f styles/main.css"

# Test 5: Check if main JS file exists
run_test "Main JS file exists" "test -f scripts/app.js"

# Test 6: Build process test
echo "Testing build process..."
if npm run build >/dev/null 2>&1; then
    echo -e "Build process: ${GREEN}PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "Build process: ${RED}FAIL${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 7: Check if dist directory was created with proper files
run_test "Dist directory created properly" "test -d dist && test -f dist/index.html"

# Test 8: Check if all required files are in dist
run_test "All required files in dist" "test -d dist/styles && test -d dist/scripts && test -f dist/robots.txt"

# Test 9: Check if HTML is valid (basic check)
run_test "HTML syntax check" "grep -q '<!DOCTYPE html>' dist/index.html && grep -q '</html>' dist/index.html"

# Test 10: Check if CSS files are not empty
run_test "CSS files not empty" "test -s dist/styles/main.css"

# Test 11: Check if JS files are not empty
run_test "JS files not empty" "test -s dist/scripts/app.js"

# Test 12: Check domain references
run_test "Domain references updated" "grep -q 'internetclock.online' dist/robots.txt && grep -q 'internetclock.online' dist/sitemap.xml"

# Test 13: Start local server test
echo "Testing local server startup..."
if command -v python3 >/dev/null 2>&1; then
    cd dist
    timeout 5s python3 -m http.server 8000 >/dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2
    
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000" | grep -q "200"; then
        echo -e "Local server test: ${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "Local server test: ${RED}FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    kill $SERVER_PID 2>/dev/null || true
    cd ..
else
    echo -e "Local server test: ${YELLOW}SKIP (python3 not available)${NC}"
fi

# Test 14: Check for common JavaScript errors in code
run_test "JS syntax check" "node -c dist/scripts/app.js"

# Summary
echo ""
echo "================================================="
echo "Integration Test Results:"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: chmod +x deploy-to-production.sh"
    echo "2. Run: sudo ./deploy-to-production.sh"
    echo "3. Test live site at internetclock.online"
    exit 0
else
    echo -e "${RED}Some tests failed. Please fix issues before deployment.${NC}"
    exit 1
fi
