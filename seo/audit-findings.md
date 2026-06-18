# Neurobelle — SEO audit-funn (2026-06-17)

Statisk audit av kode/schema (live-crawl umulig herfra: egress-policy blokkerer
`neurobelleklinikk.com` + jsDelivr med 403 `host_not_allowed`; Semrush Site Audit
krever oppsatt prosjekt). Live-verifisering er flyttet til Claude-in-Chrome-
prompten (`seo/claude-in-chrome-prompt.md`).

## ✅ Funnet og fikset i kode (denne kjøringen)
| # | Funn | Fiks |
|---|---|---|
| F1 | Clinic-schema `image` pekte på `favicon.ico` (Google vil ha ekte bilde); ingen `logo` | Pekt `image` + `logo` til godkjent `og-image.jpg` (jsDelivr, SHA-pinnet) |
| F2 | OG-fallback manglet `og:image`, `og:locale`, `og:site_name` | Lagt til i `seo.js` (kun når siden ikke har egne) |
| F3 | Ingen Twitter Card-tags | Lagt til `twitter:card/title/description/image` i `seo.js` |
| F4 | Nye tjenestesider hadde ingen FAQ/breadcrumb | Wiret `/hyperhidrose-oslo` + `/privat-nevrolog-oslo` i `seo.js` (forrige commit) |

## ✅ Verifisert OK i kode
- JSON-LD validerer (`JSON.parse`), 5/5 schema-typer, gyldig `@graph` med `@id`-referanser.
- Alle `dist/*.js` består `node --check`.
- Compliance: 0 merkenavn i servert kode (7-ords-scan).
- `seo.js` idempotent + SPA-trygt (mercury:load + popstate), scoped CSS.
- Selv-canonical, `lang=no`, alt-tekst-backfill, breadcrumb/FAQ-schema på plass.

## ⚠️ Kan IKKE verifiseres herfra → sjekk i Chrome (se prompt)
Disse er de mest sannsynlige reelle SEO-problemene på et nystartet Squarespace-
nettsted. Hvert punkt er en oppgave i Chrome-prompten:

| # | Mulig problem | Hvorfor det betyr noe | Hvor det fikses |
|---|---|---|---|
| L1 | Sider kan ha **«Hide page from search engines»** (noindex) på | Usynlig i Google — kritisk | Page → Settings → SEO |
| L2 | Mangler/duplikate **title + meta description** per side | Dårlig CTR/relevans | Page → SEO (bruk `page-meta.md`) |
| L3 | **Search Console** ikke verifisert, sitemap ikke sendt inn | Google vet ikke om siden | GSC + Settings → Marketing |
| L4 | **HEADER-blokk** ikke limt inn → schema/seo.js ikke live | Hele fundamentet inaktivt | Settings → Advanced → Code Injection |
| L5 | Mer enn én `<h1>` per side (Squarespace-temaer gjør ofte dette) | Svakere on-page-signal | Editor (heading-nivåer) |
| L6 | **Bilde-alt-tekst** mangler på editor-bilder | Tilgjengelighet + bilde-SEO | Editor per bilde |
| L7 | **NAP-inkonsistens** (Mona Lisa-rester, adresse-typo) | Lokal SEO/GBP-match | Footer/editor + GBP |
| L8 | Sosialt delingsbilde (og:image) ikke satt i Squarespace | Dårlige delinger | Settings → Social / page |
| L9 | **GBP** + **legelisten.no** ikke opprettet | Lokal pakke + katalog #2 | Eksterne (i prompt) |
| L10 | Søppel-backlinks ikke disavow-et | Rydder profil | GSC disavow |

## Notater / bevisste valg
- `sameAs` utelatt fra schema til GBP/legelisten/FB-URLer finnes (unngå fiktive data).
- `WebSite` `SearchAction` peker på Squarespace-søk `/search?q=` (standard).
- `og:image`-fallback bruker jsDelivr `@main` (bilder trenger ikke SHA-pinning).
