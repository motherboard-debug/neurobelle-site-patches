---
name: run-neurobelle-site-patches
description: Run, render, screenshot, and verify the Neurobelle Squarespace site-patches (dist/*.js + dist/*.css). Use when asked to run/preview/screenshot/test/verify the booking catalog (behandlinger.js), the SEO injections (seo.js — breadcrumb/FAQ/schema/alt-text), or any dist module change, since this repo has no server and no build step.
---

# Run Neurobelle site-patches

This repo ships **no server and no build**. It's a client-side overlay —
`dist/*.js` + `dist/*.css` — that a live Squarespace 7.1 site loads via HEADER
code injection (see repo `README.md`). There is nothing to `npm start`; the only
way to actually *see* a change is to **render the dist modules in a browser**.

The driver does exactly that, headless: it serves the repo locally, renders the
booking catalog and a synthetic Squarespace service page, **asserts the SEO
injections**, and writes screenshots. Drive everything through it.

> Paths below are relative to the repo root (the unit). The driver lives at
> `.claude/skills/run-neurobelle-site-patches/driver.cjs`.

## Prerequisites

Node 22 + Playwright (with its Chromium) — **already installed in this
container** (Playwright is a *global* module; Chromium at `/opt/pw-browsers`).
The driver resolves the global Playwright itself, so no `NODE_PATH` is needed.
No `apt-get` packages were required — headless Chromium launches with
`--no-sandbox` (which the driver passes) and no missing libs. If Playwright's
browser were ever absent, `npx playwright install chromium` fetches it (needs
network; not needed here).

## Run (agent path) — the driver

One command renders + verifies both modules and screenshots them:

```bash
node .claude/skills/run-neurobelle-site-patches/driver.cjs
```

Expected output (this is the real run): 15 checks, **ALL PASS** —

```
  ✓ syntax behandlinger.js … seo.js … (6 dist js files)
  ✓ catalog renders cards  (7 cards)
  ✓ html lang=no   ✓ canonical added   ✓ og:image fallback   ✓ twitter card
  ✓ BreadcrumbList JSON-LD valid  (items=2)
  ✓ FAQPage JSON-LD valid  (q=3)
  ✓ FAQ block visible  (3 items)
  ✓ image alt backfilled  ("Behandling av hyperhidrose … – Neurobelle Klinikk Oslo")
  ALL PASS
```

Exit code is `0` on all-pass, `1` on any failed check, `2` on driver crash —
so it doubles as a CI/pre-deploy gate.

Screenshots land here (gitignored):

```bash
ls .claude/skills/run-neurobelle-site-patches/artifacts/
# 01-catalog.png            booking catalog (behandlinger.js)
# 02-seo-hyperhidrose.png   service page with seo.js FAQ/schema injected
```

**Always open `02-seo-hyperhidrose.png`** to confirm the FAQ block actually
rendered (the "Ofte stilte spørsmål" accordion) — a green check on the JSON-LD
without the visible block would mean the CSS regressed.

### What the driver covers (and why)

- **`behandlinger.js`** (booking catalog) — rendered via the repo's own
  `preview-behandlinger.html`, which mounts `<div id="nb-behandlinger">`.
- **`seo.js`** (the SEO layer most PRs touch) — rendered on a **synthetic
  Squarespace service page served at the real path `/hyperhidrose-oslo`**,
  because `seo.js` branches on `location.pathname` and expects Squarespace DOM
  (`main#page article#sections`). Opening `dist/seo.js` standalone proves
  nothing — it needs the right URL + DOM, which the driver fabricates.
- It asserts every `seo.js` output: `<html lang>`, canonical, `og:image` +
  Twitter card, `BreadcrumbList` JSON-LD, **visible** FAQ + `FAQPage` JSON-LD,
  and image `alt` backfill. Plus `node --check` on all `dist/*.js`.

To verify a **different** service page, add its slug to the server's synthetic
route in `driver.cjs` (the `if (url === '/hyperhidrose-oslo')` branch) — use any
slug present in `seo.js`'s `FAQ`/`LABELS` maps (e.g. `/privat-nevrolog-oslo`).

## Run (human path)

Open `preview-behandlinger.html` in a desktop browser to eyeball the catalog
with your local `dist/` files (per `README.md`). Useless headless and it does
**not** exercise `seo.js` (no Squarespace DOM / path) — use the driver instead.

## Other repo commands (verified)

```bash
./bump-cache.sh            # prints the HEADER injection block (schema + module URLs)
node --check dist/seo.js   # quick syntax gate for one module
```

`./validate-deploy.sh` smoke-tests the **live** site — it needs network egress
to `neurobelleklinikk.com` + jsDelivr, which is blocked in this container (403),
so it only runs post-deploy from an unrestricted machine. Don't expect it to
pass here.

## Gotchas (battle scars from building this)

- **Playwright is GLOBAL, and ESM `import` ignores `NODE_PATH`.** `require()`
  honors `NODE_PATH`, ESM `import` does not — so `import 'playwright'` fails with
  `ERR_MODULE_NOT_FOUND` even when `node -e "require('playwright')"` works. The
  driver is `.cjs` and resolves the global path itself (`npm root -g`), so it
  Just Works without env juggling. Keep it CJS.
- **Chromium needs `--no-sandbox`** in this container or `launch()` hangs/fails;
  the driver passes it.
- **Egress is blocked (jsDelivr + the live site return 403).** That's why the
  driver serves `dist/` **locally** and never hits the CDN. The preview HTML
  also references local `dist/` (relative URLs), not jsDelivr — by design.
- **`seo.js` won't inject if you just open the file or the homepage.** Its FAQ
  is keyed to specific slugs (`/hyperhidrose-oslo`, `/privat-nevrolog-oslo`, …)
  and it appends into `main#page`. The driver fabricates that exact context.
- **The catalog's "Bestill time" CTA points to `/bestill-time`**, which 404s
  locally — expected, not a failure (the preview bar says so).
- **`seo.js` `og:image` points at jsDelivr `@main`.** The driver only checks the
  `<meta>` *attribute* is set (no fetch), so the egress block doesn't matter.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ERR_MODULE_NOT_FOUND: playwright` | You rewrote the driver as ESM. Keep it `.cjs`; ESM `import` ignores `NODE_PATH` for the global install. |
| `Target page/context closed` / launch hang | Missing `--no-sandbox` (the driver sets it); confirm `/opt/pw-browsers/chromium-*/chrome-linux/chrome` exists. |
| `catalog renders cards (0 cards)` | `behandlinger.js` threw — check the `page-js-error` line in the output; render `preview-behandlinger.html` in a real browser to see the stack. |
| `FAQ block visible (0 items)` but JSON-LD ✓ | `seo.css` didn't load or the `.nb-faq` markup changed — open `02-seo-hyperhidrose.png`. |
