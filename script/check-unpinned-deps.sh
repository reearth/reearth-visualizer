#!/usr/bin/env bash
# Check for unpinned dependencies in web/e2e package.json files
# Unpinned = uses range operators (^, ~, *, >=, >, <, <=) instead of exact versions

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXIT_CODE=0

# Colors (disabled if not a terminal)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' BOLD='' NC=''
fi

header() { echo -e "\n${BOLD}=== $1 ===${NC}"; }
ok() { echo -e "  ${GREEN}✓${NC}  $1"; }
fail() { echo -e "  ${RED}✗${NC}  $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }

check_package_json() {
  local pkg="$1"
  local label="$2"

  if [ ! -f "$pkg" ]; then
    warn "$label: $pkg not found, skipping"
    return
  fi

  header "$label"

  local unpinned
  unpinned=$(jq -r '
    ["dependencies","devDependencies","peerDependencies","optionalDependencies"] as $sections |
    [ $sections[] as $s | .[$s] // {} | to_entries[] | select(.value | test("[\\^~*xX]|>=|<=|>[^=]|<[^=]|\\|\\||^(latest|next|canary)$")) | "\($s)\t\(.key)\t\(.value)" ] |
    sort[] // empty
  ' "$pkg" 2>/dev/null || true)

  if [ -n "$unpinned" ]; then
    local count
    count=$(echo "$unpinned" | wc -l | tr -d ' ')
    (echo -e "SECTION\tPACKAGE\tVERSION"; echo "$unpinned") | column -t -s $'\t' | sed 's/^/  /'
    fail "$count unpinned dependency(ies) found"
    EXIT_CODE=1
  else
    ok "All dependencies pinned to exact versions"
  fi
}

# --- Run checks ---
echo -e "${BOLD}Dependency Pin Check${NC}"
echo "Scanning for unpinned or unstable dependencies..."

check_package_json "${REPO_ROOT}/web/package.json" "Web (web/package.json)"
check_package_json "${REPO_ROOT}/e2e/package.json" "E2E (e2e/package.json)"

echo ""
if [ "$EXIT_CODE" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}All checks passed!${NC}"
else
  echo -e "${RED}${BOLD}Unpinned dependencies found. Pin them to exact versions for reproducible builds.${NC}"
fi

exit "$EXIT_CODE"
