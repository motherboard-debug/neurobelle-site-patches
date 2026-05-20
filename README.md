# Neurobelle site-patches

JS + CSS overlay that turns a stock Squarespace 7.1 site (`neurobelleklinikk.com`) into a working patient-facing booking experience that bridges to PatientSky.

Pushed to GitHub → served by jsDelivr → loaded by Squarespace via HEADER Code Injection.

**Repo:** `motherboard-debug/neurobelle-site-patches`

---

## What's where

```
sq_patch_v2/
├── README.md                  ← this file
├── dist/                      ← THE production files (served via jsDelivr)
│   ├── booking.css            ← site-wide CSS for /bestill-time (legacy v2 widget)
│   ├── booking.js             ← site-wide redirect router (CTAs → /bestill-time)
│   ├── behandlinger.css       ← /behandlinger (now at /bestill-time URL) catalog styles
│   ├── behandlinger.js        ← /behandlinger catalog module (7 cards, 22 services)
│   ├── site-polish.css        ← site-wide mobile typography + spacing
│   ├── site-polish.js         ← injects "Se alle behandlinger" link on service pages
│   └── img/                   ← local images for behandlinger.js
│       └── *.jpg              ← (parkinson, vaksine, henvisning, overvekt, resept)
│
├── cloudflare-worker/         ← Telegram bridge + agent-send email endpoint
│   ├── worker.js              ← Cloudflare Worker (deploy via wrangler)
│   ├── wrangler.toml          ← CF config
│   └── README.md              ← deploy guide
│
├── install-hooks.sh           ← (re)installs the pre-commit hook on fresh clone
├── bump-cache.sh              ← prints HEADER injection block pinned to HEAD SHA
├── validate-deploy.sh         ← smoke-tests the live site after a push
│
├── code-injection/            ← LEGACY: original v2 booking page source (not used by jsDelivr)
└── custom-css/                ← LEGACY: original v2 booking CSS source (not used)
```

Only `dist/` is served by jsDelivr. Everything else is dev tooling.

---

## Deploy workflow

The whole pipeline:

```
Edit dist/*.{js,css}
   ↓
git commit && git push          (pre-commit hook validates JS syntax)
   ↓
jsDelivr serves the new file
   ↓
./bump-cache.sh | pbcopy         (generates HEADER block pinned to new SHA)
   ↓
Paste into Squarespace HEADER + Save
   ↓
./validate-deploy.sh             (smoke-test the live site)
```

### Why `bump-cache.sh` uses commit SHA instead of `@main`

`@main` URLs have an aggressive jsDelivr edge cache that can lag the actual GitHub state for hours. Commit-pinned URLs (`@abc1234/dist/foo.js`) are immutable and bypass that cache. Trade-off: each code change requires a fresh HEADER paste. `bump-cache.sh` makes that one command.

When jsDelivr cache lag becomes too painful, deploy the Cloudflare Worker (`cloudflare-worker/`) and self-host the assets.

---

## One-time setup on a fresh machine

```bash
git clone https://github.com/motherboard-debug/neurobelle-site-patches.git
cd neurobelle-site-patches
./install-hooks.sh    # installs pre-commit JS syntax check
```

---

## What's on the live Squarespace page (kept in sync via HEADER injection)

Paste the output of `./bump-cache.sh` into Squarespace → Settings → Advanced → Code Injection → HEADER. Replaces what's there. It includes:

- `booking.css` / `booking.js` — site-wide CTA → `/bestill-time` redirect routing
- `behandlinger.css` / `behandlinger.js` — the catalog mount, served on any page with `<div id="nb-behandlinger"></div>`
- `site-polish.css` / `site-polish.js` — mobile typography, touch targets, "Se alle behandlinger" link
- JSON-LD MedicalClinic + Physician schema (3 doctors)

Catalog page setup (one-time, manual in Squarespace UI): on a page (currently `/bestill-time`), add a Code block with just:

```html
<div id="nb-behandlinger"></div>
```

The catalog renders into that div.

---

## Quick-reference scripts

| Script | Purpose |
|---|---|
| `./install-hooks.sh` | Install the pre-commit JS-syntax-check hook (run once after fresh clone) |
| `./bump-cache.sh` | Print the HEADER injection block pinned to HEAD commit |
| `./bump-cache.sh \| pbcopy` | Same, but copy to macOS clipboard |
| `./validate-deploy.sh` | Smoke-test live site for 7 common failure modes |

---

## PatientSky integration

`serviceProviderId` is hardcoded in `dist/behandlinger.js`:

```js
const PS_PROVIDER_ID = '98b4722e-3418-11f1-a9b0-12f246543b9f';
```

Booking flow: patient clicks variant CTA on /behandlinger → opens `https://psno-patient-platform-fe.svc.pasientsky.no/embedded/planner/booking?serviceProviderId=<UUID>` in a new tab → patient picks slot inside PatientSky → books.

Per-treatment deep-linking is wired but unused (set each variant's `psTimeslotTypeId` once you have the UUIDs from PatientSky admin).

---

## Norwegian marketing-law constraints baked in

Never put these words in patient-facing copy (regulation: `Forskrift om reklame for legemidler` + `Markedsføringsloven`):

- `Botox` (brand name)
- `botulinumtoksin` (prescription active substance)
- Other brand names: `Dysport`, `Xeomin`, `Bocouture`, `Restylane`, `Juvederm`

Use `medikamentell behandling` / `injeksjonsbehandling` / generic descriptors instead.

`validate-deploy.sh` checks for accidental reintroduction.

---

## Common operations

### Add a new treatment
Edit `dist/behandlinger.js` — find the `SERVICES` array and add an entry (or add a variant to an existing umbrella). Push, run `bump-cache.sh`, paste, save in Squarespace, run `validate-deploy.sh`.

### Hide the booking flow temporarily
Comment out the `behandlinger.js` line in the HEADER injection, save. Catalog disappears, rest of site untouched.

### Roll back to a previous version
`./bump-cache.sh` uses HEAD. To use an older commit, manually edit the script's `SHA` variable, or just `git reset --hard <sha>` then run normal flow.

### Test a change before deploying
1. Edit `dist/*` locally
2. Open `preview-behandlinger.html` (also in repo root) to see /behandlinger rendered with your local files
3. When happy: commit + push as usual

---

## See also

- `cloudflare-worker/README.md` — Telegram bridge + agent-send email deploy guide
- `/Users/avidahelse/motherboard/overnight/` — full plan/log of every change made
- `/Users/avidahelse/.claude/projects/-Users-avidahelse-motherboard/memory/` — operating brief for the agent
