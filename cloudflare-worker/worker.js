/* ============================================================
   Neurobelle — Cloudflare Worker
   Bridges Telegram bot ↔ Gmail inbox + provides /send-email
   endpoint the agent uses to actually send mail (Gmail MCP only
   creates drafts).

   Deploy: see README.md

   Endpoints:
   - GET  /              health check
   - POST /tg-webhook    Telegram bot webhook → forwards to Gmail
   - POST /send-email    Agent calls this to send a real email

   Env / Secrets (set via `wrangler secret put`):
   - TELEGRAM_BOT_TOKEN     bot token from BotFather
   - INBOX_EMAIL            where Telegram messages get forwarded
                            (default: motherboard@neurobelleklinikk.com)
   - EMAIL_FROM             From: address for outbound mail
                            (default: motherboard@neurobelleklinikk.com)
   - EMAIL_FROM_NAME        From: display name (default: "Neurobelle")
   - AGENT_TOKEN            shared secret the agent uses to auth
                            /send-email — required
   ============================================================ */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health
    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ ok: true, service: 'neurobelle-bridge', time: new Date().toISOString() });
    }

    // Telegram → email forward
    if (url.pathname === '/tg-webhook' && request.method === 'POST') {
      return handleTelegram(request, env);
    }

    // Agent calls this to send a real (not draft) email
    if (url.pathname === '/send-email' && request.method === 'POST') {
      return handleSendEmail(request, env);
    }

    return json({ ok: false, error: 'not found' }, 404);
  },
};

// ---------- TELEGRAM WEBHOOK ---------------------------------------------------

async function handleTelegram(request, env) {
  let update;
  try {
    update = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const msg = update.message || update.edited_message;
  if (!msg || !msg.text) {
    // Ignore non-text updates (photos, stickers, system events) — return 200 so
    // Telegram doesn't keep retrying.
    return json({ ok: true, ignored: 'non-text update' });
  }

  const fromUser = msg.from
    ? `${msg.from.first_name || ''} ${msg.from.last_name || ''} (@${msg.from.username || 'no_username'})`.trim()
    : 'unknown';
  const chatId = msg.chat?.id;
  const text = msg.text;

  const subject = `[Telegram from ${fromUser}] ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`;
  const body = [
    `From: ${fromUser}`,
    `Chat ID: ${chatId}`,
    `Time: ${new Date(msg.date * 1000).toISOString()}`,
    '',
    '---',
    text,
    '---',
    '',
    'Reply by sending a POST to this worker /send-email with',
    `  {"to": "telegram-reply@neurobelleklinikk.com", "subject": "RE: ${subject}",`,
    `   "body": "...", "telegram_chat_id": "${chatId}"}`,
    '(routing the response back to Telegram is a separate step — wire when ready.)',
  ].join('\n');

  const inbox = env.INBOX_EMAIL || 'motherboard@neurobelleklinikk.com';
  const sent = await sendViaMailchannels({
    to: inbox,
    subject,
    text: body,
    fromEmail: env.EMAIL_FROM || 'motherboard@neurobelleklinikk.com',
    fromName: env.EMAIL_FROM_NAME || 'Neurobelle Telegram bridge',
  });

  if (!sent.ok) {
    return json({ ok: false, error: 'mail send failed', detail: sent.detail }, 500);
  }
  return json({ ok: true, forwarded: true });
}

// ---------- AGENT-CALLED SEND ENDPOINT ----------------------------------------

async function handleSendEmail(request, env) {
  // Auth
  const auth = request.headers.get('authorization') || '';
  const expected = `Bearer ${env.AGENT_TOKEN || ''}`;
  if (!env.AGENT_TOKEN || auth !== expected) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const { to, subject, body, cc, bcc, replyTo } = payload || {};
  if (!to || !subject || !body) {
    return json({ ok: false, error: 'missing fields: to, subject, body required' }, 400);
  }

  // Soft rate-limit: don't allow blasts to more than 10 recipients (matches Kaviyan's standing approval gate)
  const recipientCount = [].concat(toArray(to), toArray(cc), toArray(bcc)).length;
  if (recipientCount > 10) {
    return json({ ok: false, error: 'recipient count > 10 — requires Kaviyan approval per playbook' }, 403);
  }

  const sent = await sendViaMailchannels({
    to,
    cc,
    bcc,
    subject,
    text: body,
    replyTo,
    fromEmail: env.EMAIL_FROM || 'motherboard@neurobelleklinikk.com',
    fromName: env.EMAIL_FROM_NAME || 'Neurobelle Klinikk',
  });

  if (!sent.ok) {
    return json({ ok: false, error: 'mail send failed', detail: sent.detail }, 500);
  }
  return json({ ok: true, sent: true });
}

// ---------- MAILCHANNELS SEND --------------------------------------------------
// Cloudflare Workers ship with free Mailchannels-based mail sending.
// No SMTP credentials needed. Spam-safe because CF + Mailchannels handle DKIM via the
// worker's domain (you set up DKIM once when you point the domain at the worker).

async function sendViaMailchannels({ to, cc, bcc, subject, text, fromEmail, fromName, replyTo }) {
  const personalization = {
    to: toArray(to).map(e => ({ email: e })),
  };
  if (cc) personalization.cc = toArray(cc).map(e => ({ email: e }));
  if (bcc) personalization.bcc = toArray(bcc).map(e => ({ email: e }));
  if (replyTo) personalization.reply_to = { email: replyTo };

  const body = {
    personalizations: [personalization],
    from: { email: fromEmail, name: fromName },
    subject,
    content: [{ type: 'text/plain', value: text }],
  };

  const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (resp.status >= 200 && resp.status < 300) return { ok: true };
  const detail = await resp.text().catch(() => '(no body)');
  return { ok: false, detail: `HTTP ${resp.status}: ${detail.slice(0, 300)}` };
}

// ---------- HELPERS ------------------------------------------------------------

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
