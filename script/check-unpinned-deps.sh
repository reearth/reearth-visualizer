#!/usr/bin/env bash
# Check for unpinned dependencies in web/e2e package.json files
# Unpinned = uses range operators (^, ~, *, >=, >, <, <=), x/X wildcards, || ranges, or dist-tags (latest, next, canary) instead of exact versions

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXIT_CODE=0

# Colors (disabled if not a terminal)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  RED='' GREEN='' BOLD='' NC=''
fi

header() { echo -e "\n${BOLD}=== $1 ===${NC}"; }
ok() { echo -e "  ${GREEN}✓${NC}  $1"; }
fail() { echo -e "  ${RED}✗${NC}  $1"; }

check_package_json() {
  local pkg="$1"
  local label="$2"

  if [ ! -f "$pkg" ]; then
    fail "$label: $pkg not found"
    EXIT_CODE=1
    return
  fi

  header "$label"

  if ! command -v jq >/dev/null 2>&1; then
    fail "$label: 'jq' command not found; cannot check $pkg"
    EXIT_CODE=1
    return
  fi

  local unpinned
  if ! unpinned=$(jq -r '
    ["dependencies","devDependencies","peerDependencies","optionalDependencies"] as $sections |
    [ $sections[] as $s | .[$s] // {} | to_entries[] | select(.value | test("[\\^~*]|>=|<=|>[^=]|<[^=]|\\|\\||^[0-9]+\\.[xX]|^(latest|next|canary)$")) | "\($s)\t\(.key)\t\(.value)" ] |
    sort[] // empty
  ' "$pkg"); then
    fail "$label: Failed to parse $pkg with jq"
    EXIT_CODE=1
    return
  fi

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
