#!/usr/bin/env bash
# Smoke-tests the live Neurobelle site after a deploy.
# Catches the most common breakage modes:
#   - jsDelivr @main serving a stale cached version
#   - Forbidden words slipping back into copy (Botox, etc.)
#   - Catalog page lost its mount div
#   - Schema JSON-LD missing
#   - JS syntax errors making it through
#
# Run from anywhere:
#   ./validate-deploy.sh
#
# Exit code 0 = all green, nonzero = at least one failure.

set -u

SITE="https://www.neurobelleklinikk.com"
CDN="https://cdn.jsdelivr.net/gh/motherboard-debug/neurobelle-site-patches@main/dist"
CATALOG_PATH="/bestill-time"

FAIL=0
pass() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
fail() { printf "  \033[31m✗\033[0m %s\n" "$1"; FAIL=$((FAIL+1)); }

echo "=== 1. live pages respond 200 ==="
for path in "" "/about" "$CATALOG_PATH" "/legekonsultasjon-oslo" "/hodepine-migrene-oslo" "/vektreduksjon-oslo"; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L -A "Mozilla/5.0" "$SITE$path")
  if [ "$code" = "200" ]; then pass "$SITE$path → $code"
  else fail "$SITE$path → $code (expected 200)"
  fi
done

echo ""
echo "=== 2. catalog page has the mount div ==="
if curl -sS -L -A "Mozilla/5.0" "$SITE$CATALOG_PATH" | grep -q "nb-behandlinger"; then
  pass "catalog div present on $CATALOG_PATH"
else
  fail "catalog div MISSING on $CATALOG_PATH — module won't render"
fi

echo ""
echo "=== 3. all 4 modules load from jsDelivr ==="
for f in booking.css booking.js behandlinger.css behandlinger.js site-polish.css site-polish.js; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$CDN/$f")
  if [ "$code" = "200" ]; then pass "$f → 200"
  else fail "$f → $code"
  fi
done

echo ""
echo "=== 4. behandlinger.js syntax checks (served live) ==="
NODE=$(command -v node || true)
if [ -z "$NODE" ] && [ -x /opt/homebrew/bin/node ]; then NODE=/opt/homebrew/bin/node; fi
if [ -n "$NODE" ]; then
  for f in booking.js behandlinger.js site-polish.js; do
    curl -sS "$CDN/$f" > "/tmp/check-$f"
    if "$NODE" --check "/tmp/check-$f" 2>/dev/null; then pass "$f parses"
    else fail "$f HAS SYNTAX ERROR ON LIVE"
    fi
  done
else
  echo "  (node not found — skipping JS syntax check)"
fi

echo ""
echo "=== 5. forbidden words not in live code (Norwegian marketing law) ==="
for word in "Botox" "botulinumtoksin" "Neurobella"; do
  hits=$(curl -sS "$CDN/behandlinger.js" | grep -c -i "$word")
  if [ "$hits" = "0" ]; then pass "no '$word' in behandlinger.js"
  else fail "'$word' appears $hits times in behandlinger.js — violation"
  fi
done

echo ""
echo "=== 6. schema.org MedicalClinic on homepage ==="
homepage=$(curl -sS -L -A "Mozilla/5.0" "$SITE/")
for schema_type in "MedicalClinic" "Physician" "Dr. Ardavan" "Dr. Giti"; do
  if echo "$homepage" | grep -q "$schema_type"; then pass "schema mentions '$schema_type'"
  else fail "schema missing '$schema_type'"
  fi
done

echo ""
echo "=== 7. jsDelivr @main matches latest pushed commit ==="
LATEST_SHA=$(git -C "$(dirname "$0")" rev-parse --short HEAD 2>/dev/null || echo "?")
if [ "$LATEST_SHA" != "?" ]; then
  # If main and pinned-commit URLs return different content lengths, propagation is lagging
  main_len=$(curl -sS "$CDN/behandlinger.js" | wc -c | tr -d ' ')
  pin_len=$(curl -sS "https://cdn.jsdelivr.net/gh/motherboard-debug/neurobelle-site-patches@$LATEST_SHA/dist/behandlinger.js" | wc -c | tr -d ' ')
  if [ "$main_len" = "$pin_len" ]; then pass "@main = @$LATEST_SHA (lengths match: $main_len bytes)"
  else fail "@main is STALE: $main_len bytes vs @$LATEST_SHA: $pin_len bytes — use commit-pinned URLs in header injection until @main catches up"
  fi
fi

echo ""
if [ "$FAIL" = "0" ]; then
  printf "\033[32m=== ALL CHECKS PASS ===\033[0m\n"
  exit 0
else
  printf "\033[31m=== %d CHECKS FAILED ===\033[0m\n" "$FAIL"
  exit 1
fi
