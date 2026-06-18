# Prompt for Claude in Chrome — Neurobelle SEO go-live

Copy everything between the lines into Claude in Chrome with the Squarespace
admin (`neurobelleklinikk.com`) open and logged in. It performs the
editor/admin-only fixes that can't be done from the repo. The repo branch
`claude/neurobelle-seo-audit-5gy5yp` (PR #2) holds every artifact it refers to.

> **Why a separate prompt:** Squarespace has no API. These steps need a logged-in
> browser session. The agent that prepared this could not reach the live site
> (locked egress), so it pre-built all the content/schema and left the live
> application to you + Claude in Chrome.

---

```
You are my SEO go-live operator for the Squarespace site neurobelleklinikk.com
(NOT neurobelle.no). I have the admin open and am logged in. Work through the
tasks IN ORDER. After each task, tell me what you changed and paste a one-line
confirmation. 

GUARDRAILS (non-negotiable):
- COMPLIANCE: Never put prescription-drug brand names in any public copy
  (Botox, botulinumtoksin, Dysport, Xeomin, Bocouture, Restylane, Juvederm).
  Hyperhidrose and migraine are MEDICAL services — never market Botox as
  aesthetic. No guarantees, no before/after promises. If any existing page
  copy violates this, FLAG it to me, don't silently change medical meaning.
- PUBLISH GATE: Do not hit "Publish"/"Save" on a brand-new page or on medical/
  blog body copy until I confirm. Drafting + filling fields is fine; going live
  with medical content needs my explicit yes.
- ANTI-CHURN: Only change the specific field each task names. Don't restyle or
  reorganize anything else.
- Reference files live in the GitHub repo motherboard-debug/
  neurobelle-site-patches (branch claude/neurobelle-seo-audit-5gy5yp). I'll
  paste file contents when you ask, or you can open them on github.com.

=== TASK 1 — Activate the schema + SEO module (highest leverage) ===
Go to Settings → Advanced → Code Injection → HEADER. Replace the entire HEADER
contents with the block from the repo file seo/header-block.html (I'll paste
it). Save. This activates: expanded JSON-LD (WebSite+SearchAction, MedicalClinic
OfferCatalog, 3 Physicians), and the seo.js module (per-page breadcrumb + FAQ
schema, image alt-text, lang, canonical, Open Graph + Twitter cards).
CONFIRM: after saving, the HEADER ends with a <script type="application/ld+json">
block and six jsDelivr <script>/<link> lines.

=== TASK 2 — Indexability check (find hidden pages) ===
For EACH of these pages, open Page → Settings → SEO and make sure
"Hide this page from search engines" is OFF:
  Home, /om-oss, /bestill-time, /legekonsultasjon-oslo, /hodepine-migrene-oslo,
  /vektreduksjon-oslo, /priser, /behandlinger.
Also check Settings → not site-wide-private. Report any page that was hidden.

=== TASK 3 — Titles + meta descriptions (existing pages) ===
For each existing page below, set the SEO Title and SEO/Meta Description in
Page → Settings → SEO, using the exact text from repo file seo/page-meta.md
(I'll paste it). Pages: Home, /legekonsultasjon-oslo, /hodepine-migrene-oslo,
/vektreduksjon-oslo, /om-oss, /bestill-time. Don't invent text — use the file.

=== TASK 4 — Heading + image hygiene on existing service pages ===
On /legekonsultasjon-oslo, /hodepine-migrene-oslo, /vektreduksjon-oslo:
  a) Ensure exactly ONE H1 (the page's main heading). If the theme rendered the
     title AND a heading both as H1, demote the secondary one to H2. Flag before
     changing if ambiguous.
  b) For each content image with no alt text, add a short descriptive Norwegian
     alt (e.g. "Lege i konsultasjon hos Neurobelle Klinikk i Oslo"). No brand
     drug names.

=== TASK 5 — NAP consistency ===
In the footer and contact/about content, make the clinic name, address and phone
EXACTLY: "Neurobelle Klinikk · Arbeidersamfunnets plass 1, 0181 Oslo ·
+47 458 17 755". Remove any leftover "Mona Lisa Klinikken" text. Flag anything
that looks like a different address/phone before changing.

=== TASK 6 — Social sharing image ===
Settings → Marketing → (or page-level) Social Sharing: confirm a default social
image is set. If none, set the clinic logo/photo. (seo.js already adds an
og:image fallback, but a native one is better.)

=== TASK 7 — Create the new pages (DRAFT, await my OK to publish) ===
Create these pages with the exact SLUG, paste H1 + body from the matching repo
file in seo/ready-to-publish/, then set Title/Meta from seo/page-meta.md:
  /hyperhidrose-oslo        ← hyperhidrose-oslo.md
  /privat-nevrolog-oslo     ← privat-nevrolog-oslo.md
  /hudpleie-oslo            ← estetiske-sider.md (section 1)
  /filler-oslo              ← estetiske-sider.md (section 2)
  /rynkebehandling-oslo     ← estetiske-sider.md (section 3)
Add the internal links listed at the bottom of each file. Leave as DRAFT.
The two MEDICAL pages need my (clinic) approval before publish.
NOTE: once /hyperhidrose-oslo and /privat-nevrolog-oslo are live, the FAQ block
+ FAQ/breadcrumb schema appear automatically (already wired in seo.js).

=== TASK 8 — Blog posts (DRAFT, await my OK) ===
Create 4 draft blog posts from seo/ready-to-publish/: blogg-migrene.md,
blogg-slankemedisin.md (⚠️ prescription-drug advertising rules — keep generic,
flag to me), blogg-hyperhidrose-og-fastlege.md (two posts). Set their
Title/Meta. Add the internal links. Leave as DRAFT for clinic approval.

=== TASK 9 — Google Search Console ===
Connect/verify neurobelleklinikk.com in Google Search Console (Squarespace:
Settings → Marketing → SEO, or via search.google.com/search-console). Submit the
sitemap: neurobelleklinikk.com/sitemap.xml. Request indexing for Home + the 3
existing service pages. Report verification status.

=== TASK 10 — Local SEO (external sites) ===
a) Google Business Profile: create/claim for "Neurobelle Klinikk", category
   medical clinic, NAP exactly as Task 5, service area Oslo. Don't duplicate an
   existing listing — search first.
b) legelisten.no: create/claim the clinic listing (a competitor ranks #2 for
   "nevrolog oslo" via this directory).
c) When GBP/legelisten/Facebook URLs exist, send them back to me so I add them
   as schema "sameAs".

=== TASK 11 — Disavow junk backlinks ===
In Search Console, upload a disavow file for the 16 spam links (Moldovan link
farm + five fiverr-*-seo.site domains). I'll provide the list.

When done, give me a checklist of what's live, what's drafted-awaiting-approval,
and anything you flagged.
```

---

## Operator notes (for Kaviyan, not for the agent)
- Paste `seo/header-block.html`, `seo/page-meta.md`, and the relevant
  `seo/ready-to-publish/*.md` into the chat when the agent asks.
- Re-run `./validate-deploy.sh` after Task 1 — expect all-green.
- After GBP/legelisten exist, ping me (the repo agent) with the URLs and I'll
  patch `sameAs` into the schema and regenerate the header block.
