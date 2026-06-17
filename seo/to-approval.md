# Neurobelle — «til godkjenning» (krever Kaviyan)

Alt under er **utenfor agentens kontroll** (krever live-tilgang, eksterne
kontoer eller medisinsk faglig godkjenning). Bunten i git er ferdig og venter.

> 🤖 **Raskeste vei:** kjør hele listen via **`seo/claude-in-chrome-prompt.md`**
> (11 ordnede oppgaver for Claude in Chrome). Statiske funn: `seo/audit-findings.md`.

## A. Aktivér bunten live (1 handling, låser opp tiltak 1–7 i scorecard)
- [ ] Lim inn innholdet i **`seo/header-block.html`** i **Squarespace →
      Settings → Advanced → Code Injection → HEADER** (erstatt eksisterende
      blokk). Save. *(Ingen terminal nødvendig — fila er ferdig generert.
      Alternativt: `./bump-cache.sh | pbcopy`.)*
- [ ] Kjør `./validate-deploy.sh` etterpå — skal være all-green.
- ↳ Dette aktiverer: utvidet schema (WebSite/OfferCatalog), breadcrumb- og
  FAQ-schema, alt-tekst, lang, canonical, OG-fallback.

## A2. Publiser nye sider/blogg (copy er ferdig)
- [ ] Lim inn sidene fra **`seo/ready-to-publish/`** (5 sider + 4 blogposter)
      med riktig slug + title/meta fra `page-meta.md`. Se mappens README.
- [ ] Medisinske sider + blogg: **legegodkjenning før publisering.**

## B. Medisinsk faglig godkjenning (compliance)
- [ ] Godkjenn FAQ-copy i `dist/seo.js` (3 sider: legekonsultasjon, hodepine/
      migrene, vektreduksjon). Edruelig, ingen garantier, ingen merkenavn —
      men **medisinsk innhold skal signeres av lege før det går live**.
- [ ] Godkjenn meta/H1 for nye sider i `page-meta.md` før publisering.

## C. Indeksering / Search Console (krever domene-tilgang)
- [ ] Verifiser `neurobelleklinikk.com` i Google Search Console.
- [ ] Send inn sitemap (`/sitemap.xml` — Squarespace genererer automatisk).
- [ ] Sjekk at ingen nøkkelside står som `noindex` (Squarespace → Page →
      SEO → «Hide page from search engines» skal være AV).
- [ ] Bekreft robots.txt ikke blokkerer (Squarespace-default er OK).
- [ ] Be om indeksering av forsiden + de 3 tjenestesidene.

## D. Lokal SEO + autoritet
- [ ] **Google Business Profile** (Oslo): opprett/krev, NAP **eksakt** lik
      schema: `Neurobelle Klinikk · Arbeidersamfunnets plass 1, 0181 Oslo ·
      +47 458 17 755`. Fjern «Mona Lisa Klinikken»-rester. Pass på å ikke
      forveksles med `neurobelle.no`.
- [ ] **legelisten.no** — opprett/krev klinikkoppføring (konkurrent rangerer
      #2 på «nevrolog oslo» — bli listet der).
- [ ] Norske helsekataloger: 1881, gulesider, Doktoronline-typer, evt. Aleris/
      Volvat-uavhengige kataloger.
- [ ] **Når GBP/legelisten/Facebook-URLer finnes:** legg dem inn som `sameAs`
      i schema-grafen (`bump-cache.sh`) — utelatt nå for å unngå fiktive data.

## E. Backlinks
- [ ] Disavow/ignorer de 16 søppel-lenkene (moldovsk lenkefarm + 5×
      `fiverr-*-seo.site`). Last opp disavow-fil i Search Console. **Ikke**
      bygg videre på disse.

## F. Måling (gir den faktiske «100/100»)
- [ ] Sett opp **Semrush-prosjekt** for domenet → kjør Site Audit (krever at
      bunten er live først). Det er denne målingen Del C sikter til.
- [ ] Kjør Lighthouse (PageSpeed Insights) på forsiden + tjenestesidene → mål
      SEO = 100, fiks evt. tema-spesifikke funn.

---

### Hvorfor agenten stoppet her (per Del C / Del E)
Alt innenfor egen kontroll er bygget og validert i git. De gjenstående
punktene er **utelukkende** blokkert på live-publisering og eksterne kontoer
(Kaviyan). Sikkerhetsregelen sier da: stopp og rapporter — ikke spinn.
