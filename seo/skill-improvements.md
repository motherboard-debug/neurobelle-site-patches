# Neurobelle — skills/verktøy brukt + forbedringer til neste kjøring

## Brukt denne kjøringen
| Verktøy | Bruk | Verdi |
|---|---|---|
| Git + repo-lesing | Forsto patch-arkitekturen (jsDelivr → HEADER) | høy — fant den eneste reelle leveringskanalen |
| Semrush MCP (`overview_research`) | Pre-flight connectivity-test | bekreftet koblet; baseline allerede verifisert (Del A) |
| Node (`--check`, `JSON.parse`) | Validerte seo.js + JSON-LD lokalt | høy — fanget feil før commit |
| `validate-deploy.sh` | Compliance-/modulvakt (utvidet) | høy — selv-validerende |

## Ikke tilgjengelig (men forutsatt av prompten)
- **`/seo-audit`-skillet** — IKKE installert i dette miljøet. Manuell on-page-
  jobb gjorde nytten, men skillet ville strukturert audit-loopen.
  → *Neste kjøring:* installer/registrer `/seo-audit` før start.
- **Claude in Chrome** — ikke tilgjengelig i dette remote-miljøet. Derfor
  kunne ingenting publiseres live i Squarespace (forventet — Del D-gate).
- **Lighthouse / PageSpeed MCP** — ingen måte å måle live teknisk score.
  → *Neste kjøring:* legg til et PageSpeed-MCP eller kjør audit etter publisering.

## Reelle forbedringer til prompten/loopen
1. **«100/100»-stoppbetingelsen er ikke målbar uten live + Search Console +
   Semrush-prosjekt.** Anbefalt: del i to mål — (a) «bunten bygget & validert»
   (oppnåelig autonomt, denne kjøringen ✅) og (b) «live-score 100» (krever
   Kaviyan-gate). Da slipper loopen å «spinne» mot et utilgjengelig tall.
2. **Squarespace-no-API betyr at meta/title-injeksjon hører hjemme i SEO-
   panelet, ikke i JS.** Derfor leverte vi de som paste-bunt (`page-meta.md`)
   og holdt JS til det Google leser fra rendret DOM (JSON-LD, alt, lang, OG).
3. **Schema bør ikke inneholde `sameAs` før URL-ene finnes** — unngå fiktive
   data. Parkert til GBP/legelisten er på plass.
4. Neste loop bør starte med å kjøre `validate-deploy.sh` *etter* at HEADER er
   re-pastet, og deretter en Semrush Site Audit for å lukke (b).

## Diff-oppsummering (denne kjøringen)
- `dist/seo.js` (ny) — breadcrumb/FAQ-schema, alt-tekst, lang, canonical, OG
- `dist/seo.css` (ny) — FAQ-blokk-styling (scoped)
- `bump-cache.sh` — WebSite+SearchAction, OfferCatalog, knowsAbout, hasMap; +seo.css/js
- `validate-deploy.sh` — seo-moduler + 7 merkenavn × 2 filer i compliance-vakt
- `seo/*.md` — scorecard, content-calendar, page-meta, to-approval, denne fila
