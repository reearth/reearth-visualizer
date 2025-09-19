#!/usr/bin/env sh
set -eu

# Find nearest ancestor yarn.lock
find_up() {
  name="$1"; d="$PWD"
  while [ "$d" != "/" ]; do
    [ -f "$d/$name" ] && { printf '%s/%s\n' "$d" "$name"; return 0; }
    d=$(dirname "$d")
  done
  return 1
}

LOCKFILE="${1:-$(find_up yarn.lock || true)}"
[ -n "${LOCKFILE:-}" ] && [ -f "$LOCKFILE" ] || { echo "❌ yarn.lock not found"; exit 3; }

echo "Scanning: $LOCKFILE"

FOUND=0

# Read banned list WITHOUT using a pipe (avoids subshell)
while IFS=' ' read -r name ver; do
  [ -z "${name:-}" ] && continue
  pat="resolution: \"${name}@npm:${ver}\""
  if grep -qF "$pat" "$LOCKFILE"; then
    FOUND=$((FOUND+1))
    # show where it matched for debugging
    grep -nF "$pat" "$LOCKFILE"
  fi
done <<'EOF'
ansi-styles 6.2.2
debug 4.4.2
chalk 5.6.1
supports-color 10.2.1
strip-ansi 7.1.1
ansi-regex 6.2.1
wrap-ansi 9.0.1
color-convert 3.1.1
color-name 2.0.1
is-arrayish 0.3.3
slice-ansi 7.1.1
color 5.0.1
color-string 2.1.1
simple-swizzle 0.2.3
supports-hyperlinks 4.1.1
has-ansi 6.0.1
chalk-template 1.1.1
backslash 0.2.1
EOF

if [ "$FOUND" -gt 0 ]; then
  echo "❌ Detected $FOUND banned resolution(s) in $LOCKFILE"
  exit 1
else
  echo "✅ No banned resolutions found in $LOCKFILE"
fi