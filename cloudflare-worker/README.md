# Neurobelle Cloudflare Worker

Tiny worker that bridges two gaps the Gmail MCP can't fill:

1. **Telegram → email** — your bot's messages forwarded to `motherboard@neurobelleklinikk.com` so the hourly cron picks them up.
2. **Programmatic email send** — the agent can POST `/send-email` to send real mail (the Gmail MCP only creates drafts).

Uses Cloudflare's free [Mailchannels](https://mailchannels.net) integration — no SMTP setup, no per-message cost.

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

# Random shared secret the agent uses to authenticate /send-email calls
# Generate one: openssl rand -hex 32
wrangler secret put AGENT_TOKEN
```

The worker is now live at:
```
https://neurobelle-bridge.<your-cf-subdomain>.workers.dev
```

### Wire up Telegram

Tell Telegram where to send updates:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://neurobelle-bridge.<your-cf-subdomain>.workers.dev/tg-webhook"
```

Test by messaging your bot — within a few seconds you should see the message arrive in `motherboard@neurobelleklinikk.com` inbox with subject `[Telegram from <your name>] <message>`.

### DKIM (recommended — prevents spam-folder for outbound)

The worker uses Mailchannels which requires DKIM setup for delivery from `@neurobelleklinikk.com`:

1. In Cloudflare DNS for `neurobelleklinikk.com`, add a TXT record:
   - Name: `_mailchannels`
   - Value: `v=mc1 cfid=<your-cf-subdomain>.workers.dev`

2. Add DKIM key (Mailchannels generates this — see [Mailchannels DKIM guide](https://support.mailchannels.com/hc/en-us/articles/7122849237389-Adding-a-DKIM-Signature)).

3. Set SPF if not already: `v=spf1 include:relay.mailchannels.net ~all`

Without DKIM the worker still sends, but mail may land in spam.

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

## Hard limits baked into the worker

- Recipients per send capped at 10 (matches Kaviyan's standing approval gate from CLAUDE.md). Higher → 403 error, must escalate.
- Bearer auth required for `/send-email` — without `AGENT_TOKEN` set, the endpoint always returns 401.
- Non-text Telegram updates (photos/stickers/etc.) are ignored gracefully — returns 200 so Telegram stops retrying.

## What's NOT done yet

- **Reply-to-Telegram path**: when the agent wants to send a message back to a Telegram user, the worker needs a second endpoint that calls the Telegram bot API. Stub mentioned in worker code comments. Add when Phase 1 of Telegram integration proves out.
- **Webhook signature verification** for Telegram (optional — Telegram doesn't sign requests by default; use IP allowlist or shared token in webhook URL if you want belt-and-suspenders).
- **Rate-limit storage** — currently the 10-recipient cap is per-request, not per-time-window. Add Cloudflare KV-backed rate limiting if you start sending volume.
- **Health monitor** — wire to UptimeRobot or similar to alert if the worker stops responding.

## Costs

- Cloudflare Workers free tier: 100k requests/day. We'll never come close.
- Mailchannels: free for Cloudflare Workers, no per-message cost.
- Total: $0/month at expected volume.
