#!/usr/bin/env bash
# Re-installs git hooks for this repo. Run once after cloning to a new machine.
# Hooks live in .git/hooks/ which is NOT committed to GitHub, so a fresh clone
# starts without them.

set -e
HOOK_DIR=".git/hooks"

if [ ! -d "$HOOK_DIR" ]; then
  echo "✗ Run this from the repo root."
  exit 1
fi

cat > "$HOOK_DIR/pre-commit" <<'EOF'
#!/usr/bin/env bash
# Neurobelle site-patches — pre-commit syntax check
# Blocks commits that contain JS syntax errors in dist/.
set -e

NODE="$(command -v node || true)"
if [ -z "$NODE" ] && [ -x /opt/homebrew/bin/node ]; then
  NODE=/opt/homebrew/bin/node
fi
if [ -z "$NODE" ]; then
  echo "⚠ pre-commit: node not found in PATH — skipping syntax check"
  exit 0
fi

STAGED_JS=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^dist/.*\.js$' || true)
if [ -z "$STAGED_JS" ]; then
  exit 0
fi

FAILED=""
for f in $STAGED_JS; do
  if ! "$NODE" --check "$f" 2>/dev/null; then
    echo "❌ $f has a syntax error:"
    "$NODE" --check "$f" 2>&1 | head -10
    FAILED="$FAILED $f"
  fi
done

if [ -n "$FAILED" ]; then
  echo ""
  echo "Commit blocked — fix the syntax errors above, then re-commit."
  echo "(To bypass intentionally: git commit --no-verify)"
  exit 1
fi

echo "✓ pre-commit: all staged dist/*.js pass syntax check"
exit 0
EOF

chmod +x "$HOOK_DIR/pre-commit"
echo "✓ Installed pre-commit hook (.git/hooks/pre-commit)"
echo "  Future commits will be blocked if dist/*.js has syntax errors."
echo "  Bypass with: git commit --no-verify"
