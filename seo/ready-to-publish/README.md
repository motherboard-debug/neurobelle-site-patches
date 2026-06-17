# Ready-to-publish bundle (Del F-leveranse)

Ferdig, compliant copy klar til å lime inn i Squarespace. Alt er **edruelig,
uten merkenavn på legemidler, uten garantier**. Medisinsk innhold må signeres
av lege (Kaviyan) før publisering.

| Fil | Slug / post | Søkeord (vol) | Type |
|---|---|---|---|
| `hyperhidrose-oslo.md` | `/hyperhidrose-oslo` | hyperhidrose (1 900) | medisinsk side |
| `privat-nevrolog-oslo.md` | `/privat-nevrolog-oslo` | nevrolog/privat nevrolog (140) | medisinsk side |
| `estetiske-sider.md` | `/hudpleie-oslo`, `/filler-oslo`, `/rynkebehandling-oslo` | 720/480/260 | estetiske sider |
| `blogg-migrene.md` | blogg | migrene (8 100) | blogg |
| `blogg-slankemedisin.md` | blogg | slankemedisin/ozempic (2 400/14 800) | blogg ⚠️ Rx-regelverk |
| `blogg-hyperhidrose-og-fastlege.md` | 2 blogposter | hyperhidrose (1 900), lege uten fastlege | blogg |

## Slik publiserer du (per side)
1. Opprett siden i Squarespace med riktig **slug** (se tabell).
2. Lim inn H1 + brødtekst fra .md-fila.
3. Sett **title + meta** fra `seo/page-meta.md` i sidens SEO-panel.
4. Legg inn de interne lenkene som er angitt nederst i hver fil.
5. For de 2 medisinske sidene + bloggpostene: **få legegodkjenning først.**

> Når slugene `/hyperhidrose-oslo` og `/privat-nevrolog-oslo` er live, kommer
> FAQ-blokk + FAQPage/BreadcrumbList-schema **automatisk** fra `dist/seo.js`
> (allerede wiret). Ingen ekstra handling.

## Compliance-påminnelse
- «Botox»/merkenavn: aldri i copy. Hyperhidrose/migrene = medisinsk.
- Reseptbelagte legemidler markedsføres ikke mot publikum — bloggen om
  slankemedisin holdes informativ (se advarsel i den fila).
- Ingen «før/etter» eller løfter om resultat.
