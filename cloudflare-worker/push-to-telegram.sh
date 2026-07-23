#!/usr/bin/env bash
# ============================================================
# push-to-telegram.sh — push a folder of media straight to a Telegram chat.
#
# Runs on the Mac mini (the one place with the bot token, the files, AND
# network access — neither Claude session can reach Telegram directly).
#
# It talks to the Telegram Bot API directly (sendVideo/sendPhoto/sendDocument)
# — no Cloudflare Worker, no Resend, nothing else to deploy.
#
# Usage:
#   export TELEGRAM_BOT_TOKEN="8877009840:AA..."     # from @BotFather
#   export TELEGRAM_CHAT_ID="123456789"              # the chat to send into
#   ./push-to-telegram.sh /Users/avidahelse/motherboard/projects/social/pool-klinikk/ready/
#
#   # optional: only send files matching a glob
#   ./push-to-telegram.sh ./ready/ "reel-2026-07-2*.mp4"
#
# Caption: if a sidecar text file exists next to a media file (same name with a
# .txt / .caption extension), its contents become the caption. Otherwise the
# filename (without extension) is used.
#
# NOTE: this does NOT call getUpdates — that would 409-conflict with agent_v4's
# polling. You must supply TELEGRAM_CHAT_ID yourself (it's printed in every
# forwarded email, or ask the bot "what is this chat id").
# ============================================================

set -euo pipefail

DIR="${1:-.}"
GLOB="${2:-*}"

if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
  echo "✗ TELEGRAM_BOT_TOKEN is not set. export it first (get it from @BotFather)." >&2
  exit 1
fi
if [[ -z "${TELEGRAM_CHAT_ID:-}" ]]; then
  echo "✗ TELEGRAM_CHAT_ID is not set. export it first (the numeric chat id to send into)." >&2
  exit 1
fi
if [[ ! -d "$DIR" ]]; then
  echo "✗ Not a directory: $DIR" >&2
  exit 1
fi

API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"

# Pick the Telegram method + form field from the file extension.
method_for() {
  case "${1##*.}" in
    mp4|mov|m4v|webm) echo "sendVideo video" ;;
    jpg|jpeg|png|webp|gif) echo "sendPhoto photo" ;;
    *) echo "sendDocument document" ;;
  esac
}

caption_for() {
  local f="$1" base="${1%.*}"
  for side in "${base}.txt" "${base}.caption" "${f}.txt"; do
    if [[ -f "$side" ]]; then head -c 1024 "$side"; return; fi
  done
  basename "$base"   # fallback: filename without extension
}

shopt -s nullglob
sent=0 failed=0
for f in "$DIR"/$GLOB; do
  [[ -f "$f" ]] || continue
  read -r method field <<<"$(method_for "$f")"
  caption="$(caption_for "$f")"

  echo "→ $method  $(basename "$f")"
  resp="$(curl -sS -X POST "${API}/${method}" \
    -F "chat_id=${TELEGRAM_CHAT_ID}" \
    -F "${field}=@${f}" \
    -F "caption=${caption}" || true)"

  if [[ "$resp" == *'"ok":true'* ]]; then
    echo "   ✓ sent"
    sent=$((sent+1))
  else
    echo "   ✗ failed: ${resp:0:200}" >&2
    failed=$((failed+1))
  fi
done

echo "-----"
echo "Done: ${sent} sent, ${failed} failed."
[[ "$failed" -eq 0 ]]
