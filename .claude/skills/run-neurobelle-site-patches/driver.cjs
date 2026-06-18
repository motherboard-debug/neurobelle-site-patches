#!/usr/bin/env node
/* ============================================================
   Neurobelle site-patches — run/verify driver
   ------------------------------------------------------------
   This repo ships no server and no build: it's client-side JS/CSS
   (dist/*) that Squarespace loads via HEADER code injection. There's
   nothing to "npm start". The only way to actually SEE a change is to
   render the dist modules in a browser. This driver does that headless:

     1. Serves the repo over http://127.0.0.1:<port> (so dist/* load by
        relative URL and synthetic pages can be served at real paths —
        seo.js branches on location.pathname).
     2. Renders the booking catalog (behandlinger.js) and screenshots it.
     3. Renders a synthetic Squarespace service page at /hyperhidrose-oslo
        with seo.css + seo.js, and asserts the SEO injections:
        BreadcrumbList JSON-LD, visible FAQ + FAQPage JSON-LD, <html lang>,
        canonical, og:image, image alt backfill. Screenshots it.
     4. node --check on every dist/*.js.

   Screenshots land in this file's ./artifacts/ . Exit code 0 = all pass.

   Playwright is a GLOBAL install in this container; we resolve it
   whether it's local or global, so no NODE_PATH juggling is needed.
   ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..'); // repo root (unit)
const ART = path.join(__dirname, 'artifacts');
fs.mkdirSync(ART, { recursive: true });

// ---- resolve playwright (local node_modules OR global) --------------------
function loadChromium() {
  try { return require('playwright').chromium; } catch (_) {}
  const groot = execSync('npm root -g').toString().trim();
  return require(path.join(groot, 'playwright')).chromium;
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// Synthetic Squarespace-like service page so seo.js (which keys off
// location.pathname and Squarespace DOM) actually injects. Deliberately
// omits <html lang>, canonical, og tags, and the <img> alt so we can prove
// seo.js fills them in.
function syntheticServicePage() {
  return `<!doctype html><html><head><meta charset="utf-8">
<title>Behandling av hyperhidrose (overdreven svette) i Oslo — Neurobelle</title>
<meta name="description" content="Medisinsk vurdering og behandling av hyperhidrose i Oslo.">
<link rel="stylesheet" href="/dist/seo.css"></head>
<body><header><nav>Neurobelle</nav></header>
<main id="page"><article id="sections">
  <section><h1>Behandling av hyperhidrose (overdreven svette) i Oslo</h1>
  <p>Sliter du med overdreven svette?</p>
  <img src="/dist/img/overvekt.jpg" width="320"></section>
</article></main>
<footer><p>Neurobelle Klinikk · Arbeidersamfunnets plass 1, 0181 Oslo · +47 458 17 755</p></footer>
<script src="/dist/seo.js"></script></body></html>`;
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    // synthetic SEO harness pages: any mapped service slug
    if (url === '/hyperhidrose-oslo') {
      res.writeHead(200, { 'content-type': 'text/html' });
      return res.end(syntheticServicePage());
    }
    const rel = url === '/' ? '/preview-behandlinger.html' : url;
    const file = path.join(ROOT, decodeURIComponent(rel));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

(async () => {
  // ---- 0. dist/*.js syntax ------------------------------------------------
  for (const f of fs.readdirSync(path.join(ROOT, 'dist')).filter(f => f.endsWith('.js'))) {
    try { execSync(`node --check ${path.join(ROOT, 'dist', f)}`, { stdio: 'pipe' }); check(`syntax ${f}`, true); }
    catch (e) { check(`syntax ${f}`, false, String(e.stderr || e).slice(0, 120)); }
  }

  const chromium = loadChromium();
  const server = await startServer();
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  page.on('pageerror', e => check('page-js-error', false, e.message.slice(0, 120)));

  // ---- 1. booking catalog (behandlinger.js) -------------------------------
  await page.goto(`${base}/preview-behandlinger.html`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.nbb-card', { timeout: 8000 }).catch(() => {});
  const cardCount = await page.locator('.nbb-card').count();
  check('catalog renders cards', cardCount > 0, `${cardCount} cards`);
  await page.screenshot({ path: path.join(ART, '01-catalog.png'), fullPage: true });

  // ---- 2. SEO injections (seo.js) on a synthetic service page -------------
  await page.goto(`${base}/hyperhidrose-oslo`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.nb-faq', { timeout: 8000 }).catch(() => {});

  const seo = await page.evaluate(() => {
    const parse = (id) => { const el = document.getElementById(id); try { return el ? JSON.parse(el.textContent) : null; } catch { return 'INVALID'; } };
    const bc = parse('nb-breadcrumb-ld');
    const faq = parse('nb-faq-ld');
    const img = document.querySelector('main img');
    return {
      lang: document.documentElement.getAttribute('lang'),
      canonical: !!document.querySelector('link[rel="canonical"]'),
      ogImage: (document.querySelector('meta[property="og:image"]') || {}).content || null,
      twitter: !!document.querySelector('meta[name="twitter:card"]'),
      breadcrumbType: bc && bc['@type'],
      breadcrumbItems: bc && bc.itemListElement && bc.itemListElement.length,
      faqType: faq && faq['@type'],
      faqCount: faq && faq.mainEntity && faq.mainEntity.length,
      faqVisible: document.querySelectorAll('.nb-faq__item').length,
      imgAlt: img && img.getAttribute('alt'),
    };
  });
  check('html lang=no', seo.lang === 'no', `lang=${seo.lang}`);
  check('canonical added', seo.canonical);
  check('og:image fallback', !!seo.ogImage, seo.ogImage ? 'present' : 'missing');
  check('twitter card', seo.twitter);
  check('BreadcrumbList JSON-LD valid', seo.breadcrumbType === 'BreadcrumbList', `items=${seo.breadcrumbItems}`);
  check('FAQPage JSON-LD valid', seo.faqType === 'FAQPage', `q=${seo.faqCount}`);
  check('FAQ block visible', seo.faqVisible > 0, `${seo.faqVisible} items`);
  check('image alt backfilled', !!seo.imgAlt && seo.imgAlt.length > 0, JSON.stringify(seo.imgAlt));
  await page.screenshot({ path: path.join(ART, '02-seo-hyperhidrose.png'), fullPage: true });

  // ---- 3. SPA nav: <head> persists on Squarespace Ajax, so per-page schema
  //         must UPDATE and stale FAQ must be CLEARED (regression guard) -----
  const nav = await page.evaluate(() => {
    history.pushState({}, '', '/om-oss');                 // a no-FAQ page
    const art = document.querySelector('main#page article#sections');
    art.innerHTML = '<h1>Om oss</h1><p>Møt legene.</p>';   // Ajax body swap
    document.dispatchEvent(new Event('mercury:load'));      // seo.js re-runs (sync)
    const bc = (() => { const el = document.getElementById('nb-breadcrumb-ld'); try { return el ? JSON.parse(el.textContent) : null; } catch { return 'INVALID'; } })();
    return {
      faqLdGone: !document.getElementById('nb-faq-ld'),
      faqBlockGone: !document.querySelector('.nb-faq'),
      breadcrumbLast: bc && bc.itemListElement && bc.itemListElement[bc.itemListElement.length - 1].name,
    };
  });
  check('SPA nav clears stale FAQ JSON-LD', nav.faqLdGone);
  check('SPA nav clears stale FAQ block', nav.faqBlockGone);
  check('SPA nav updates breadcrumb', nav.breadcrumbLast === 'Om oss', `last=${nav.breadcrumbLast}`);

  await browser.close();
  server.close();

  // ---- report -------------------------------------------------------------
  let failed = 0;
  console.log('\n  Neurobelle site-patches — driver results\n  ' + '-'.repeat(46));
  for (const r of results) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
  }
  console.log('  ' + '-'.repeat(46));
  console.log(`  screenshots: ${path.relative(ROOT, ART)}/01-catalog.png, 02-seo-hyperhidrose.png`);
  console.log(failed === 0 ? '  \x1b[32mALL PASS\x1b[0m\n' : `  \x1b[31m${failed} FAILED\x1b[0m\n`);
  process.exit(failed === 0 ? 0 : 1);
})().catch(e => { console.error('DRIVER CRASH:', e); process.exit(2); });
