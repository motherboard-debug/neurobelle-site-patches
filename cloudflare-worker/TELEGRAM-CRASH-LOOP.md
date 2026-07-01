# Telegram Agent V4 — crash-loop diagnosis & fix

Symptom (from the watchdog messages in Telegram):

```
🔴 Watchdog: boten krasjer i løkke (3 restarts siste time). Starter IKKE på nytt — sjekk agent_v4.log manuelt.
🚀 Telegram Agent V4 kjører! …
🟡 Watchdog: boten var nede — startet på nytt 2026-07-01 20:50:14
🚀 Telegram Agent V4 kjører! …
🟡 Watchdog: boten var nede — startet på nytt 2026-07-01 20:55:19
🔴 Watchdog: boten krasjer i løkke …
```

The bot announces "V4 kjører!", dies seconds later, the watchdog restarts it, and it
dies again — a tight restart loop that the watchdog eventually gives up on.

> **Where the code lives:** `agent_v4` runs on the Mac (`Mac-kontroll: Aktiv`), under
> `/Users/avidahelse/motherboard/overnight/`. It is **not** in this repo — this repo only
> holds the stateless Cloudflare Worker bridge (`worker.js`). So the actual fix is applied
> on the Mac; this doc is the runbook.

---

## #1 most likely cause: `409 Conflict` — webhook vs. polling on one bot token

A Telegram bot token can deliver updates **one way only**: either

- a **webhook** (Telegram POSTs updates to a URL — what this repo's `worker.js /tg-webhook` uses), **or**
- **long polling** (`getUpdates` — what an interactive agent like `agent_v4` almost always uses).

If a webhook is registered on the token, every `getUpdates` call the agent makes returns:

```
409 Conflict: can't use getUpdates method while webhook is active
```

An unhandled 409 on startup throws → the process exits → the watchdog restarts it →
it throws again → crash loop. This is the single most common way to land exactly the
pattern above, and it's easy to create by accident: deploying the Worker bridge and
pointing `setWebhook` at the **same** bot token the Mac agent polls.

### Confirm it

```bash
# Replace <TOKEN> with the agent's bot token.
curl -s "https://api.telegram.org/bot<TOKEN>/getWebhookInfo" | python3 -m json.tool
```

- If `"url"` is **non-empty** (e.g. the `…workers.dev/tg-webhook` URL) while the agent
  polls → **this is your bug.**
- Also check `agent_v4.log` for `409`, `Conflict`, `terminated by other getUpdates`,
  or `TelegramConflictError`.

### Fix — pick ONE owner of the token

**Option A (recommended): give the two systems separate bots.**
Create a second bot in @BotFather for the email bridge, set the Worker webhook on
*that* token, and leave the agent's token webhook-free. Best isolation; the agent and
the bridge can both run forever.

**Option B: the agent owns the token, drop the webhook.**
If you don't need the Worker's Telegram→email forwarding, delete the webhook so polling works:

```bash
curl -s "https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=true"
```

Then don't call `setWebhook` on that token again. (`/send-email` and `/tg-send` in the
Worker keep working — they don't need a webhook.)

**Option C: make polling self-heal.** Have the agent call `deleteWebhook` once at startup
before it starts polling, and treat a 409 as "back off and retry", not "crash":

```python
# pseudo-code at agent startup, before polling
bot.delete_webhook(drop_pending_updates=False)
```

Belt-and-suspenders even if you also do A.

---

## #2 other things that produce the same loop (check `agent_v4.log`)

Whatever the real error is, it will be in `agent_v4.log` right before each restart. Common ones:

| Log signature | Cause | Fix |
|---|---|---|
| `401 Unauthorized` from api.telegram.org | Bot token wrong / revoked | Re-issue token in @BotFather, update the agent's config |
| `ModuleNotFoundError` / `ImportError` | venv not activated, or a dependency vanished after an OS/Python upgrade | Reinstall deps in the agent's venv; pin the interpreter path in the launch script |
| `KeyError`/`ValueError` on an env var | A required secret (bot token, API key) is missing from the launch environment | Export it in the same shell/plist that starts the agent, not just your interactive shell |
| Traceback on a specific `/command` | A handler (e.g. `/skjerm`, `/shell`, `/rapport`) throws and isn't wrapped | Wrap each command handler in try/except so one bad command can't kill the process |
| Instant exit, no traceback | Two copies of the agent running (old one not killed on restart) → they 409 each other | Make the launcher `kill` the previous PID before starting; single-instance lockfile |

The fastest triage:

```bash
tail -n 120 /Users/avidahelse/motherboard/overnight/agent_v4.log
```

The last traceback before a `🚀 … kjører!` line is the crash you need to fix.

---

## #3 harden the watchdog so a loop degrades gracefully

The current watchdog already does the right high-level thing (stop after 3 restarts/hour
instead of hammering forever). Two cheap improvements:

1. **Exponential backoff** between restarts (5s → 30s → 2m) instead of a fixed interval —
   a token 409 or a bad deploy won't burn CPU or spam the chat.
2. **Include the last log line in the alert.** Change the "krasjer i løkke" message to append
   `tail -n 1 agent_v4.log` so the Telegram alert itself tells you *why* it died, without
   having to SSH into the Mac.

---

## TL;DR

1. `curl …/getWebhookInfo` — if a webhook URL is set on the polling agent's token, that's the loop.
2. Fix it with a **separate bot for the Worker bridge** (Option A) or `deleteWebhook` (Option B),
   and have the agent `deleteWebhook` + tolerate 409 on startup (Option C).
3. If the log shows a different error, use the table above.
4. Make the watchdog back off exponentially and quote the last log line in its alert.
