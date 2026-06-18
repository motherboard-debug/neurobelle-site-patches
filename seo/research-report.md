# Neurobelle — SEO deep-research report + execution plan

**Date:** 2026-06-17 · **Domain:** neurobelleklinikk.com (Squarespace 7.1) · **Method:** 5-angle fan-out web research (fact-checked, cited) + live Semrush MCP data. Sources cited inline; confidence flagged. Where research **corrected** an earlier assumption, it's marked ⚠️REVISED.

> **Tooling caveat:** this environment's egress blocks the live site, jsDelivr, and most doc domains (WebFetch 403), so "official" claims come from WebSearch snippets of those docs cross-referenced across sources. Semrush data is live via MCP. Re-verify exact UI menu paths against the live product before acting.

---

## 0. Executive summary (read this if nothing else)

1. **You're starting from true zero** — Semrush `domain_rank` (NO) returns `NOTHING FOUND`: 0 ranking keywords, confirmed live today. This is greenfield, so the win is fundamentals, not tricks.
2. **Your keyword targets are unusually winnable.** Real KD (NO): every target is **KD ≤40** — all rankable for a new domain without heavy link-building. **hyperhidrose (vol 1 900, KD 22, ~103 results)** and **fastlege oslo (1 000, KD 30, 108 results)** are the best volume-to-difficulty plays in Norway right now, and both are **medical-compliant** (no Botox-as-aesthetic problem).
3. **Three expectations need resetting** (details below): FAQ rich results are being **deprecated** (still useful for AI, not for snippets); **medical schema doesn't create rich results** (only Review/Breadcrumb do); and **AI visibility has no markup trick** — it's reviews + off-site mentions + local/branded intent.
4. **Disavow is now LOW priority** ⚠️REVISED — Google says only disavow genuine manipulative links; your 16 spam links are nofollow junk Google already ignores.
5. **Biggest single lever for you: Google Business Profile + real reviews.** For a local YMYL clinic, that beats anything you can do in page markup.

---

## 1. Verified baseline — live Semrush data (NO database)

| Metric | Value | Source |
|---|---|---|
| Organic keywords | 0 (`NOTHING FOUND`) | Semrush `domain_rank`, live |
| Authority Score | 0 | Del A / Semrush |
| Backlinks | 16, all nofollow, spam | Del A |

### Keyword priority matrix (live Semrush `phrase_these` + `phrase_kdi`, NO)

| Keyword | Vol/mo | KD | Competition | Results | Tier |
|---|---|---|---|---|---|
| **hyperhidrose** | 1 900 | **22** | 0.08 | ~103 | 🥇 Win now |
| **fastlege oslo** | 1 000 | **30** | 0.11 | ~108 | 🥇 Win now |
| migrene behandling | 390 | 22 | 0.41 | high | 🥇 Win now |
| privat nevrolog | 140 | 16 | 0.45 | ~95 | 🥇 Win now |
| nevrolog oslo | 140 | 15 | 0.61 | high | 🥈 Easy, low vol |
| filler oslo | 480 | 12 | 0.63 | high | 🥈 Easy |
| rynkebehandling oslo | 260 | 10 | 0.79 | 14 500 | 🥈 Easy |
| vektreduksjon | 720 | 33 | 0.86 | high | 🥉 Possible |
| hudklinikk oslo | 880 | 40 | 0.63 | 37 700 | 🥉 Possible |
| hudpleie oslo | 720 | 40 | 0.49 | high | 🥉 Possible |
| slankemedisin | 2 400 | n/a | **0.99** (heavy ads) | ~105 | ⚠️ Rx-law sensitive |
| botox mot svette | 1 000 | n/a | 0.33 | 4 950 | ✋ capture via *hyperhidrose* (no brand word) |

**KD bands** (Semrush, [blog](https://www.semrush.com/blog/keyword-difficulty/)): 0–14 very easy · 15–29 easy (achievable for new domains) · 30–49 possible (needs strong content) · 50+ needs backlinks. **None of your targets are 50+** — so a year-one plan can realistically rank all of them with good content + on-page, before authority even compounds.

---

## 2. Squarespace 7.1 — what code can and can't control (Angle 1)

| Control | Reality | Action |
|---|---|---|
| Header/Footer Code Injection | Site-wide; **per-page injection needs Business plan+** | You already use it (your booking/SEO modules) |
| **Injected JS on SPA/Ajax nav** | With Mercury/Ajax, injected `<script>` does **not** re-run on in-site navigation; bind to `mercury:load` | ✅ your `seo.js` already does this — validated correct |
| Per-page title/meta | Native SEO tab; title formats use `%s`/`%p`/`%i` | Use it (your `page-meta.md`) |
| noindex | Per-page "Hide from search results" toggle **also removes the URL from sitemap** | Verify none are toggled on key pages |
| sitemap.xml | **Auto-generated** at `/sitemap.xml`, not editable | Submit to GSC |
| robots.txt | **Auto-managed, NOT editable** | Nothing to do |
| canonical | **Auto-set, NOT editable**; injecting one adds a *second* tag (don't) ⚠️ | Leave native canonicals alone |
| 301 redirects | Native URL Mappings `/old -> /new 301`; **can't redirect homepage or files**; case-sensitive | Use for any slug changes |
| JSON-LD | Google **does** read JS-injected JSON-LD (renders with Chromium) **but static markup is more reliable** ([Google](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript)) | Your core schema is **static in header injection = the reliable path** ✅ |
| AMP | **Discontinued Feb 2025**; stale `?format=amp` URLs may linger | Check for `?format=amp` duplicates in GSC |
| Core Web Vitals | Core `site-bundle.js` is render-blocking and **can't be deferred**; images auto-lazy-load | Limit custom fonts/scripts, compress images |

**Implication for your stack:** the architecture is sound. Static schema in the HEADER block is the reliable part; `seo.js` breadcrumb/FAQ injection is a correctly-built supplement (uses `mercury:load`). The one upgrade worth considering later: move per-page schema to **per-page header injection (static)** if you're on Business plan, for max reliability.

Sources: Squarespace Help Center (code injection, sitemap, URL mappings); [Google JS structured data](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript); [sf.digital on Mercury](https://sf.digital/squarespace-solutions/why-doesnt-my-code-work-until-i-refresh-the-page).

---

## 3. Structured data & local/medical SEO (Angle 3) — two expectation resets

- ⚠️**REVISED — Medical schema types do NOT generate rich results.** `MedicalClinic`/`Physician`/`LocalBusiness` give Google **entity understanding** (good for Knowledge Graph + AI), but the only *visible* rich enhancements come from `Review`/`AggregateRating` (review stars) and `BreadcrumbList`. Your schema is still worth having — just don't expect star snippets from it. ([Schema App](https://www.schemaapp.com/schema-markup/healthcare-schema-markup-evolution-of-the-physician-rich-result/))
  - **To earn visible stars:** collect **real** patient reviews, show them on-page, mark up with `Review`. **Never** add `AggregateRating` without real on-page reviews — that's a Google **policy violation**.
  - Your `Physician` nodes correctly link to the clinic via `worksFor`/`@id` ✅. Keep `sameAs` for GBP/legelisten once those URLs exist (a real Knowledge-Graph signal).
- ⚠️**REVISED — FAQ rich results are deprecated.** Google restricted FAQ rich results to authoritative gov/health sites (Aug 2023) and is **fully removing them ~2026**. Your `FAQPage` markup is **still valid and worth keeping** — but as an **AI-extraction / clean-Q&A** play, not a rich-snippet play. The *visible on-page Q&A* is what AI lifts; the markup is secondary. Only mark up genuine Q&A (fake FAQ = spam risk). ([Search Engine Land](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957))
- **Google Business Profile is your top local lever.** 8 of the top-10 local-pack signals come from the GBP itself ([BrightLocal](https://www.brightlocal.com/learn/google-local-algorithm-and-ranking-factors/)). Pick the **most specific primary category** ("Neurologist" / "Medical clinic"), keep NAP identical to schema, add services, post ~monthly, and **get reviews + respond to them**.
- **Norway citations:** `legelisten.no` (legally entrenched after a 2021 Supreme Court ruling), plus `1881.no`, `gulesider.no`, `proff.no`. Value is **indirect** (NAP consistency + entity trust + backlinks + `sameAs` targets) — no special direct ranking weight.
- **Rebrand handling (Mona Lisa → Neurobelle):** ⚠️ never create a new GBP — **edit the existing one**; fix the old name across directories in a tight window to minimize NAP inconsistency.

---

## 4. AI / LLM visibility (Angle 5) — mostly myth-busting

- **HIGH confidence, official:** AI search visibility = **SEO done well**. Google states there's **no special schema, no llms.txt, no "chunking"** needed for AI Overviews/AI Mode. ([Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))
- ⚠️**llms.txt — skip it.** A 2024 proposal, **no major engine honors it** (Google's Illyes confirmed July 2025), ~10% adoption, negligible crawler interest. Not a visibility tactic.
- **Strongest empirical AI lever = off-site brand mentions + entity consistency + reviews**, not on-page markup ([Semrush ghost-citations study](https://www.semrush.com/blog/the-ghost-citations-study/); Princeton GEO paper [arxiv 2311.09735](https://arxiv.org/abs/2311.09735) — adding statistics/quotes/citations lifts AI visibility ~30-40%).
- **YMYL reality check:** for general medical-info queries, AI Overviews disproportionately cite Mayo Clinic / WebMD / Healthline ([SE Ranking](https://seranking.com/blog/ai-overviews-and-ymyl-topics-research/)). **Don't fight them.** Your AI win is **local + branded + transactional** intent ("hyperhidrose behandling Oslo", "Neurobelle Klinikk anmeldelser", "privat nevrolog Oslo") where GBP, reviews, and entity consistency dominate — exactly the levers in §3.
- **Crawlability:** allowing `OAI-SearchBot`/`PerplexityBot` helps but is **softer than claimed** (OpenAI walked back "block = invisible" in Dec 2025). Being in **Bing's index** matters for ChatGPT. Squarespace's auto robots.txt already allows crawling, so nothing to do.

**Net:** your original "AI-synlighet" goal is achieved mostly through GBP + reviews + the local content plan + entity consistency — not technical markup. The schema/FAQ work helps entity understanding and is worth keeping; just don't over-invest expecting it to be the AI lever.

---

## 5. Measurement stack (Angle 4)

1. **Search Console** — verify via DNS TXT (cleanest on Squarespace; HTML file upload is **not** supported) or HTML meta tag in header injection. Submit `sitemap.xml`. Use URL Inspection → Request Indexing for key pages (~10–12/day cap). Watch Clicks/Impressions/CTR/Avg Position; use the new **branded-vs-non-branded filter** (Nov 2025) — non-branded is your real SEO KPI.
2. **GA4** — install via Settings → Developer Tools → External API Keys (Measurement ID) **or** header injection (Business+), **not both**. Outbound clicks to PatientSky are auto-tracked by Enhanced Measurement. **`tel:`/`mailto:` clicks now need Google Tag Manager** (GA4 dropped native config ~Nov 2024).
3. **Link GSC↔GA4** (adds query + landing-page reports in GA4) and **connect both to Semrush** (overlays rank with conversions; imports your real ranking keywords).
4. **KPIs, first 3–6 months** — *Leading* (move first): pages indexed, impressions, avg position, "near me"/city-query impressions, branded coverage. *Lagging*: clicks, CTR, bookings/calls. Indexing typically begins ~2–4 weeks; first non-branded rankings ~3–6 months.
5. **Cadence** — GSC weekly during launch then monthly; Semrush Position Tracking weekly; GA4 monthly.

Sources: [GSC verification (Squarespace)](https://support.squarespace.com/hc/en-us/articles/205813918-Verifying-your-site-with-Google-Search-Console); [GA4 events](https://support.google.com/analytics/answer/13566436); [GSC↔GA4](https://support.google.com/analytics/answer/10737381); [branded filter](https://developers.google.com/search/blog/2025/11/search-console-branded-filter).

---

## 6. Semrush workflow (Angle 2) — month-to-month

1. **Site Audit** — create project, crawl from sitemap; fix **Errors before Warnings**; Site Health is issue-frequency-based, not page-count. Re-crawl weekly. (This is the tool that gives the real "site health %" the original brief wanted — it needs the project set up first.)
2. **Position Tracking** — campaign for Oslo (city/postcode), device = mobile primary; add the §1 keywords; add competitors (volvat.no, aleris.no, cerebrum.no, legelisten.no) up to 10; watch **Visibility %**.
3. **Keyword Magic / Keyword Gap** vs those competitors monthly for new long-tail.
4. **Backlink Audit** — ⚠️ low priority (see §7).
5. **Monthly metrics that move:** organic-keyword count, average position, Position-Tracking Visibility %. Authority Score updates ~biweekly and is slow/logarithmic — don't watch it weekly.

---

## 7. ⚠️REVISED — Disavow is now LOW priority

Earlier I queued disavowing the 16 spam links. The research corrects this: **Google recommends disavow only for genuine manipulative links or a manual action.** Your 16 links are **nofollow junk Google already ignores**, and there's no manual action on a 0-authority new site. **Recommendation: skip the disavow** unless GSC shows a manual action or you later acquire manipulative *dofollow* links. (Semrush [how-to-disavow](https://www.semrush.com/blog/how-to-disavow/) frames it as "find out if you really should.") This removes Task 11 from the urgent list.

---

## 8. The execution plan (prioritized)

### Phase 0 — Activate what's built (this week, ~1 hour)
- [ ] Paste the **merge-safe HEADER block** (the one I gave you that preserves `site-redesign` + your style) → activates schema + `seo.js` site-wide. *(Done = §2 reliable static schema live.)*
- [ ] Verify in GSC (DNS TXT) + submit `sitemap.xml` + request indexing for Home + 3 service pages.
- [ ] Confirm no key page has "Hide from search results" on; check for stale `?format=amp` URLs.

### Phase 1 — Capture the uncontested winners (weeks 1–3)
Publish, in this order (highest volume-to-KD first), from your ready-to-publish bundle:
1. **`/hyperhidrose-oslo`** (1 900 vol, KD 22) — your single best opportunity.
2. **`/legekonsultasjon-oslo`** retitle for **fastlege oslo** (1 000 vol, KD 30).
3. **`/privat-nevrolog-oslo`** (KD 16) + **`/hodepine-migrene-oslo`** for *migrene behandling* (KD 22).
- Each: exact title/meta from `page-meta.md`, one H1, internal links, real images with alt.

### Phase 2 — Local authority (weeks 1–4, parallel)
- [ ] **Google Business Profile** — edit existing (don't recreate), specific primary category, NAP = schema exactly, services, hours, first posts. **Start collecting reviews** (your single biggest local + AI lever).
- [ ] **legelisten.no** + 1881 + gulesider + proff.no citations, identical NAP.
- [ ] Send me the GBP/legelisten/social URLs → I add `sameAs` to schema.

### Phase 3 — Aesthetic + content depth (weeks 3–6)
- [ ] Publish `/filler-oslo` (KD 12), `/rynkebehandling-oslo` (KD 10), `/hudpleie-oslo` & `/hudklinikk-oslo` angle (KD 40).
- [ ] Blog: migrene (8 100 info), hyperhidrose, slankemedisin (⚠️ generic, Rx-law), lege-uten-fastlege — each linking to its service page.
- [ ] Add **real reviews + Review schema** on service pages for star eligibility.

### Phase 4 — Measure & iterate (monthly, ongoing)
- [ ] Semrush Site Audit (fix errors), Position Tracking review, Keyword Gap for new long-tail.
- [ ] GSC: non-branded clicks/impressions, "near me"/Oslo queries, avg position.
- [ ] Re-run this assessment monthly; diff vs last month; next content batch.

### Deprioritized / don't bother
- ❌ llms.txt · ❌ disavow (no manual action) · ❌ expecting FAQ/medical-schema rich snippets · ❌ competing with Mayo/WebMD on general medical queries · ❌ canonical/robots edits (Squarespace controls them).

---

## 9. Compliance × SEO (woven through)
- The **botox compliance constraint is an advantage here**: the compliant phrasings (*hyperhidrose* 1 900, *migrene behandling* 390) are higher-volume and lower-difficulty than the brand term — and "botox mot svette" (1 000) is captured by ranking the hyperhidrose page without ever using the brand word.
- **slankemedisin (2 400)** has 0.99 paid competition and Rx-advertising-law exposure — target it **informationally** (generic GLP-1 framing, no brand/price), with legal sign-off.
- All medical pages/posts → **legegodkjenning before publish** (you, as the doctor).

---

## 10. Confidence & caveats
- **HIGH:** Squarespace control limits; "AI = SEO, no markup trick"; FAQ/medical schema rich-result status; live Semrush keyword data.
- **MEDIUM (directional):** vendor percentage stats (category weights, AI-citation multipliers), new-site timelines, KD-to-rank mapping.
- All doc-sourced claims came via WebSearch snippets (WebFetch 403); re-verify exact UI paths live. Semrush figures are live but estimated third-party data — ground them in GSC/GA4 once connected.
