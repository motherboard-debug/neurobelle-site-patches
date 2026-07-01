# Neurobelle Cloudflare Worker

Tiny worker that bridges two gaps the Gmail MCP can't fill:

1. **Telegram → email** — your bot's messages forwarded to `motherboard@neurobelleklinikk.com` so the hourly cron picks them up.
2. **Programmatic email send** — the agent can POST `/send-email` to send real mail (the Gmail MCP only creates drafts).

Sends mail through [Resend](https://resend.com) — one REST call with an API key, generous free tier. (The old MailChannels free-for-Workers integration was shut down on 2024-06-30 and no longer works, which is why the send path was rewritten.)

> **Heads-up — the crash-looping `agent_v4` bot is a separate process.** This worker is a stateless HTTP bridge; it does not crash-loop and it is not the thing the watchdog restarts. If your Telegram *agent* is restarting in a loop, read [`TELEGRAM-CRASH-LOOP.md`](./TELEGRAM-CRASH-LOOP.md) — the usual cause is a `409 Conflict` from running this worker's **webhook** and the agent's **getUpdates polling** on the *same* bot token.

## Deploy (10 min, one-time)

### Prerequisites

- Cloudflare account (free tier is fine — covers ~100k requests/day)
- A domain on Cloudflare DNS (optional but recommended — for clean URLs + DKIM)
- `npx wrangler` installed locally: `npm install -g wrangler`

### Steps

```bash
cd cloudflare-worker
wrangler login          # opens browser, OAuth into your CF account
wrangler deploy         # deploys worker.js to *.workers.dev
```

Now set the secrets:

```bash
# Token from @BotFather when you created your Telegram bot
wrangler secret put TELEGRAM_BOT_TOKEN

# Random shared secret the agent uses to authenticate /send-email + /tg-send
# Generate one: openssl rand -hex 32
wrangler secret put AGENT_TOKEN

# Resend API key — the worker sends all mail through this (get it at resend.com,
# then verify the neurobelleklinikk.com sending domain in the Resend dashboard)
wrangler secret put RESEND_API_KEY

# OPTIONAL but recommended: a secret that must match the setWebhook secret_token
# below. Blocks anyone who guesses your /tg-webhook URL from injecting fake updates.
wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

The worker is now live at:
```
https://neurobelle-bridge.<your-cf-subdomain>.workers.dev
```

### Wire up Telegram

> ⚠️ **Do not point this webhook at a bot token that a polling agent (`agent_v4`)
> is also using.** Telegram allows exactly one delivery method per token: a
> webhook *or* `getUpdates` long-polling, never both. Setting a webhook here
> makes the polling agent crash on every loop with
> `409 Conflict: can't use getUpdates method while webhook is active` — the exact
> crash-loop in `TELEGRAM-CRASH-LOOP.md`. Use a **separate bot** for this
> email bridge, or skip the webhook and let the agent own the token.

Tell Telegram where to send updates (include the secret so only Telegram can call your webhook):

```bash
curl -X POST "https://api.telegram.org/bot<BRIDGE_BOT_TOKEN>/setWebhook" \
  -d "url=https://neurobelle-bridge.<your-cf-subdomain>.workers.dev/tg-webhook" \
  -d "secret_token=<same value you gave TELEGRAM_WEBHOOK_SECRET>"
```

Test by messaging your bot — within a few seconds you should see the message arrive in `motherboard@neurobelleklinikk.com` inbox with subject `[Telegram from <your name>] <message>`.

### Email deliverability (Resend domain verification)

Resend signs outbound mail with DKIM once you verify the sending domain:

1. In the [Resend dashboard](https://resend.com/domains), add `neurobelleklinikk.com`.
2. Resend shows a set of DNS records (DKIM + SPF/`MX` for the return-path). Add them to Cloudflare DNS for the domain.
3. Wait for Resend to mark the domain **Verified**, then `EMAIL_FROM` (`motherboard@neurobelleklinikk.com`) will deliver to the inbox instead of spam.

Until the domain is verified you can still test using Resend's sandbox `onboarding@resend.dev` as `EMAIL_FROM`.

## Use from the agent

To send mail via the worker:

```bash
curl -X POST https://neurobelle-bridge.<your-cf-subdomain>.workers.dev/send-email \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "patient@example.com",
    "subject": "Time hos Neurobelle",
    "body": "Hei!\n\nVi har bekreftet din time...",
    "replyTo": "post@neurobelleklinikk.com"
  }'
```

Response: `{"ok":true,"sent":true}` or `{"ok":false,"error":"..."}`.

To send a message **back to a Telegram chat** (reply path):

```bash
curl -X POST https://neurobelle-bridge.<your-cf-subdomain>.workers.dev/tg-send \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "chat_id": 123456789, "text": "Hei! Timen din er bekreftet." }'
```

The `chat_id` is included in every forwarded email (see the email body). Response: `{"ok":true,"sent":true,"message_id":...}`.

## Hard limits baked into the worker

- Recipients per send capped at 10 (matches Kaviyan's standing approval gate from CLAUDE.md). Higher → 403 error, must escalate.
- Bearer auth required for `/send-email` and `/tg-send` — without `AGENT_TOKEN` set, both always return 401.
- `/tg-webhook` verifies the `X-Telegram-Bot-Api-Secret-Token` header when `TELEGRAM_WEBHOOK_SECRET` is set (spoofed-update protection).
- A mail-provider failure on `/tg-webhook` returns 200 (with a `warn`) so Telegram doesn't retry the same update for hours; the error is logged via `console.error` (visible in `wrangler tail`).
- Non-text Telegram updates (photos/stickers/etc.) are ignored gracefully — returns 200 so Telegram stops retrying.

## What's NOT done yet

- **Rate-limit storage** — currently the 10-recipient cap is per-request, not per-time-window. Add Cloudflare KV-backed rate limiting if you start sending volume.
- **Health monitor** — wire to UptimeRobot or similar to alert if the worker stops responding.

## Costs

- Cloudflare Workers free tier: 100k requests/day. We'll never come close.
- Resend free tier: 3,000 emails/month, 100/day — well above expected volume.
- Total: $0/month at expected volume.
