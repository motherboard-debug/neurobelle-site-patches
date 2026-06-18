# Neurobelle — SEO scorecard (før / etter)

**Domene:** `neurobelleklinikk.com` · **Kjøring:** 2026-06-17 · **Branch:** `claude/neurobelle-seo-audit-5gy5yp`

> ⚠️ Ærlig om «100/100»: den tekniske/on-page-scoren kan ikke **måles live**
> herfra. Squarespace har ingen API, og en ekte Lighthouse-/Semrush-site-audit
> krever (a) at bunten publiseres live og (b) at domenet er satt opp som
> Semrush-prosjekt + verifisert i Search Console — begge **blokkert på Kaviyan**.
> Derfor: alt som ligger **innenfor egen kontroll** (on-page-fundamentet som
> sendes gjennom den eksisterende jsDelivr → HEADER-pipelinen) er bygget,
> validert og committet. Resten er parkert i `to-approval.md`. Per
> sikkerhetsregelen (score forbedres ikke når resten er Kaviyan-blokkert):
> **stopp og rapporter.**

## Baseline (Del A — verifiserte Semrush-data, ikke gjenoppdaget)

| Metrikk | Verdi |
|---|---|
| Organiske søkeord (NO) | 0 — NOTHING FOUND |
| Organisk trafikk | 0 |
| Authority Score | 0 / 100 |
| Backlinks | 16 / 14 domener, alle nofollow, søppel → ignorer/disavow |
| Synlig på eget merkenavn | Nei |

## Hva som er gjort denne kjøringen (✅ = committet, innenfor egen kontroll)

| # | Tiltak | Status | Hvor |
|---|---|---|---|
| 1 | `WebSite`-schema + `SearchAction` (sitelinks-søk, merkenavn-synlighet) | ✅ | `bump-cache.sh` |
| 2 | Utvidet `MedicalClinic`/`LocalBusiness`: `knowsAbout`, `areaServed` (Oslo + Norge), `hasMap`, `image`, `currenciesAccepted` | ✅ | `bump-cache.sh` |
| 3 | Compliant `OfferCatalog` (hyperhidrose + migrene som **medisinsk**, aldri Botox-som-estetisk) | ✅ | `bump-cache.sh` |
| 4 | `BreadcrumbList`-schema injisert per side (fra path) | ✅ | `dist/seo.js` |
| 5 | `FAQPage`-schema + synlige, AI-utvinnbare FAQ-blokker på 3 tjenestesider | ✅ (medisinsk copy → godkjenning) | `dist/seo.js` |
| 6 | Bilde-alt-tekst fylles fra caption/heading der den mangler | ✅ | `dist/seo.js` |
| 7 | `<html lang="no">`, self-canonical, Open Graph-fallback | ✅ | `dist/seo.js` |
| 8 | Ready-to-paste titler (50–60) + meta (150–160) per side | ✅ | `seo/page-meta.md` |
| 9 | Innholdskalender søkeord → side/post | ✅ | `seo/content-calendar.md` |
| 10 | Compliance-vakt utvidet (7 merkenavn × 2 filer) | ✅ | `validate-deploy.sh` |
| 11 | Ferdig copy (5 sider + 4 blogposter), klar-til-lim | ✅ (medisinsk → godkjenning) | `seo/ready-to-publish/` |
| 12 | FAQ + breadcrumb auto-wiret for 2 nye medisinske slugs | ✅ | `dist/seo.js` |
| 13 | Copy-paste HEADER-snapshot (uten terminal) | ✅ | `seo/header-block.html` |
| 14 | Schema `image`/`logo`: favicon → godkjent og-image | ✅ | `bump-cache.sh` |
| 15 | OG `image`/`locale`/`site_name` + Twitter Card-tags | ✅ | `dist/seo.js` |
| 16 | Statisk audit-rapport (funn + fikser) | ✅ | `seo/audit-findings.md` |
| 17 | Claude-in-Chrome go-live-prompt (11 oppgaver) | ✅ | `seo/claude-in-chrome-prompt.md` |

## Teknisk on-page sjekkliste

| Sjekk | Før | Etter (i bunten) | Note |
|---|---|---|---|
| JSON-LD valid | 1 graf (clinic+3 leger) | ✅ utvidet graf, `JSON.parse` OK | WebSite + OfferCatalog + breadcrumb + FAQ |
| Schema-typer (MedicalBusiness, Physician, LocalBusiness, FAQPage, BreadcrumbList) | 3/5 | **5/5** | MedicalClinic ⊂ MedicalBusiness |
| `lang`-attributt | avhengig av tema | ✅ garantert `no` | |
| Canonical | Squarespace-default | ✅ + fallback-vakt | |
| Alt-tekst | manglende på flere bilder | ✅ auto-fylt | |
| FAQ AI-utvinnbar | nei | ✅ details/summary + schema | |
| Forbidden-word-vakt | 3 ord × 1 fil | **7 ord × 2 filer** | |
| JS-syntaks (pre-commit + smoke) | grønt | ✅ grønt (`node --check`) | |

## Blokkert på Kaviyan (kan ikke fullføres/måles herfra) → `to-approval.md`

- Re-paste av ny HEADER-blokk i Squarespace (aktiverer 1–7 live)
- Google Search Console-verifisering + sitemap-innsending
- Google Business Profile (Oslo, NAP-konsistent)
- Listing på legelisten.no + norske helsekataloger
- Disavow av søppel-backlinks
- Semrush-prosjekt + site-audit-kjøring (gir den faktiske 100/100-målingen)
- Medisinsk godkjenning av FAQ-copy + nye tjeneste-/blogg-sider
- `noindex`/robots.txt-sjekk (krever Squarespace-adgang)

**Konklusjon:** Fundamentet er bygget og verifisert i git. Live-score og lokal
SEO/autoritet er gated på publisering + eksterne kontoer (Kaviyan). Loopen
stopper korrekt her per Del C / Del E sikkerhetsregel.
