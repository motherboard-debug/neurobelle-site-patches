/* ============================================================
   Neurobelle — Cloudflare Worker
   Bridges Telegram bot ↔ Gmail inbox + provides /send-email
   endpoint the agent uses to actually send mail (Gmail MCP only
   creates drafts).

   Deploy: see README.md

   Endpoints:
   - GET  /              health check
   - POST /tg-webhook    Telegram bot webhook → forwards to Gmail
   - POST /tg-send       Agent → send a message back to a Telegram chat
   - POST /tg-send-media Agent → send a photo/video/document (e.g. a reel MP4)
   - POST /send-email    Agent calls this to send a real email

   Env / Secrets (set via `wrangler secret put`):
   - TELEGRAM_BOT_TOKEN     bot token from BotFather
   - TELEGRAM_WEBHOOK_SECRET (optional) shared secret set when you call
                            setWebhook with `secret_token=…`. If set, the
                            worker rejects any /tg-webhook call whose
                            X-Telegram-Bot-Api-Secret-Token header doesn't
                            match — blocks spoofed webhook traffic.
   - RESEND_API_KEY         API key for Resend (https://resend.com) — the
                            worker sends mail through Resend's REST API.
                            (MailChannels' free Workers integration was shut
                            down in June 2024, so the old path no longer works.)
   - INBOX_EMAIL            where Telegram messages get forwarded
                            (default: motherboard@neurobelleklinikk.com)
   - EMAIL_FROM             From: address for outbound mail
                            (default: motherboard@neurobelleklinikk.com)
   - EMAIL_FROM_NAME        From: display name (default: "Neurobelle")
   - AGENT_TOKEN            shared secret the agent uses to auth
                            /send-email and /tg-send — required
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

    // Agent → Telegram message (reply path)
    if (url.pathname === '/tg-send' && request.method === 'POST') {
      return handleTelegramSend(request, env);
    }

    // Agent → Telegram media (photo/video/document — e.g. a reel MP4)
    if (url.pathname === '/tg-send-media' && request.method === 'POST') {
      return handleTelegramSendMedia(request, env);
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
  // If a webhook secret is configured, require it. Telegram sends the value you
  // passed to setWebhook(secret_token=…) in this header on every call.
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const got = request.headers.get('x-telegram-bot-api-secret-token') || '';
    if (got !== env.TELEGRAM_WEBHOOK_SECRET) {
      return json({ ok: false, error: 'unauthorized webhook' }, 401);
    }
  }

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
    'Reply straight back to this Telegram chat by POSTing to this worker /tg-send with',
    `  {"chat_id": ${JSON.stringify(chatId)}, "text": "…"}`,
    '  (Authorization: Bearer <AGENT_TOKEN>)',
  ].join('\n');

  const inbox = env.INBOX_EMAIL || 'motherboard@neurobelleklinikk.com';
  const sent = await sendEmail(env, {
    to: inbox,
    subject,
    text: body,
    fromEmail: env.EMAIL_FROM || 'motherboard@neurobelleklinikk.com',
    fromName: env.EMAIL_FROM_NAME || 'Neurobelle Telegram bridge',
  });

  if (!sent.ok) {
    // Log but still 200: if we 500 here Telegram retries the same update for
    // hours, and a mail-provider outage shouldn't wedge the webhook.
    console.error('tg-webhook mail send failed:', sent.detail);
    return json({ ok: true, forwarded: false, warn: 'mail send failed', detail: sent.detail });
  }
  return json({ ok: true, forwarded: true });
}

// ---------- AGENT → TELEGRAM (REPLY PATH) -------------------------------------

async function handleTelegramSend(request, env) {
  if (!checkAgentAuth(request, env)) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }
  if (!env.TELEGRAM_BOT_TOKEN) {
    return json({ ok: false, error: 'TELEGRAM_BOT_TOKEN not set' }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const { chat_id, text, parse_mode, disable_web_page_preview } = payload || {};
  if (chat_id === undefined || chat_id === null || !text) {
    return json({ ok: false, error: 'missing fields: chat_id and text required' }, 400);
  }

  const tgBody = { chat_id, text };
  if (parse_mode) tgBody.parse_mode = parse_mode;
  if (disable_web_page_preview !== undefined) tgBody.disable_web_page_preview = disable_web_page_preview;

  let resp, data;
  try {
    resp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(tgBody),
    });
    data = await resp.json().catch(() => ({}));
  } catch (e) {
    return json({ ok: false, error: 'telegram request failed', detail: String(e) }, 502);
  }

  if (!resp.ok || data.ok === false) {
    return json({ ok: false, error: 'telegram send failed', detail: data.description || `HTTP ${resp.status}` }, 502);
  }
  return json({ ok: true, sent: true, message_id: data.result?.message_id });
}

// ---------- AGENT → TELEGRAM MEDIA (photo / video / document) -----------------
// Lets the reel generator push an MP4 (or photo/document) straight into a chat —
// the "send video directly" path agent_v4 said it lacked. Two ways to call it:
//
//   A) By URL (Telegram fetches it — simplest if the file is already hosted):
//      Content-Type: application/json
//      { "chat_id": 123, "kind": "video", "url": "https://…/reel.mp4",
//        "caption": "Helsesjekk", "parse_mode": "HTML" }
//
//   B) By upload (stream the local file through — for files on the Mac):
//      Content-Type: multipart/form-data
//      fields: chat_id, kind (photo|video|document, default video),
//              caption (optional), parse_mode (optional),
//              file=<the binary>       (the media part; "video"/"photo"/"document" also accepted)
//
// Telegram bot API caps uploads at 50 MB; reels are far smaller.

const MEDIA_METHOD = { photo: 'sendPhoto', video: 'sendVideo', document: 'sendDocument' };

async function handleTelegramSendMedia(request, env) {
  if (!checkAgentAuth(request, env)) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }
  if (!env.TELEGRAM_BOT_TOKEN) {
    return json({ ok: false, error: 'TELEGRAM_BOT_TOKEN not set' }, 500);
  }

  const contentType = request.headers.get('content-type') || '';
  const base = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

  let tgUrl, fetchInit;

  if (contentType.includes('application/json')) {
    // ---- URL / file_id mode ----
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return json({ ok: false, error: 'invalid json' }, 400);
    }
    const { chat_id, url, file_id, caption, parse_mode } = payload || {};
    const kind = (payload?.kind || 'video').toLowerCase();
    const method = MEDIA_METHOD[kind];
    if (!method) {
      return json({ ok: false, error: 'kind must be photo, video, or document' }, 400);
    }
    const media = url || file_id;
    if (chat_id === undefined || chat_id === null || !media) {
      return json({ ok: false, error: 'missing fields: chat_id and url (or file_id) required' }, 400);
    }
    const tgBody = { chat_id, [kind]: media };
    if (caption) tgBody.caption = caption;
    if (parse_mode) tgBody.parse_mode = parse_mode;

    tgUrl = `${base}/${method}`;
    fetchInit = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(tgBody),
    };
  } else if (contentType.includes('multipart/form-data')) {
    // ---- Upload mode: stream the incoming file straight to Telegram ----
    let form;
    try {
      form = await request.formData();
    } catch (e) {
      return json({ ok: false, error: 'invalid multipart form' }, 400);
    }
    const chat_id = form.get('chat_id');
    const kind = String(form.get('kind') || 'video').toLowerCase();
    const method = MEDIA_METHOD[kind];
    if (!method) {
      return json({ ok: false, error: 'kind must be photo, video, or document' }, 400);
    }
    const file = form.get('file') || form.get(kind);
    if (!chat_id || !file || typeof file === 'string') {
      return json({ ok: false, error: 'missing fields: chat_id and a file part required' }, 400);
    }

    const out = new FormData();
    out.append('chat_id', chat_id);
    out.append(kind, file, file.name || `${kind}.bin`);
    const caption = form.get('caption');
    const parse_mode = form.get('parse_mode');
    if (caption) out.append('caption', caption);
    if (parse_mode) out.append('parse_mode', parse_mode);

    tgUrl = `${base}/${method}`;
    fetchInit = { method: 'POST', body: out }; // let fetch set the multipart boundary
  } else {
    return json({ ok: false, error: 'send JSON (url/file_id) or multipart/form-data (upload)' }, 415);
  }

  let resp, data;
  try {
    resp = await fetch(tgUrl, fetchInit);
    data = await resp.json().catch(() => ({}));
  } catch (e) {
    return json({ ok: false, error: 'telegram request failed', detail: String(e) }, 502);
  }

  if (!resp.ok || data.ok === false) {
    return json({ ok: false, error: 'telegram media send failed', detail: data.description || `HTTP ${resp.status}` }, 502);
  }
  return json({ ok: true, sent: true, message_id: data.result?.message_id });
}

// ---------- AGENT-CALLED SEND ENDPOINT ----------------------------------------

async function handleSendEmail(request, env) {
  // Auth
  if (!checkAgentAuth(request, env)) {
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

  const sent = await sendEmail(env, {
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
    return json({ ok: false, error: 'mail send failed', detail: sent.detail }, 502);
  }
  return json({ ok: true, sent: true });
}

// ---------- EMAIL SEND (Resend) ------------------------------------------------
// MailChannels shut down its free Cloudflare Workers integration on 2024-06-30,
// so the old api.mailchannels.net path silently 401s now. We send through Resend
// (https://resend.com) instead — free tier is plenty for this volume, and it's a
// single REST call with a Bearer key. Set the key once:
//   wrangler secret put RESEND_API_KEY
// and verify the sending domain (neurobelleklinikk.com) in the Resend dashboard.

async function sendEmail(env, { to, cc, bcc, subject, text, fromEmail, fromName, replyTo }) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, detail: 'RESEND_API_KEY not set — run `wrangler secret put RESEND_API_KEY`' };
  }

  const payload = {
    from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
    to: toArray(to),
    subject,
    text,
  };
  if (cc) payload.cc = toArray(cc);
  if (bcc) payload.bcc = toArray(bcc);
  if (replyTo) payload.reply_to = replyTo;

  let resp, detailText;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    detailText = await resp.text().catch(() => '(no body)');
  } catch (e) {
    return { ok: false, detail: `fetch failed: ${String(e)}` };
  }

  if (resp.status >= 200 && resp.status < 300) return { ok: true };
  return { ok: false, detail: `HTTP ${resp.status}: ${detailText.slice(0, 300)}` };
}

// ---------- HELPERS ------------------------------------------------------------

function checkAgentAuth(request, env) {
  const auth = request.headers.get('authorization') || '';
  const expected = `Bearer ${env.AGENT_TOKEN || ''}`;
  return Boolean(env.AGENT_TOKEN) && auth === expected;
}

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
