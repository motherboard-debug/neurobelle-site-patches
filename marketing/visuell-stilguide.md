# Visuell stilguide – Neurobelle (FAST REGEL, aug 2026)

Kaviyans direktiv — gjelder ALL bildegenerering (Bloom, fal.ai, Canva, lokal motor):

## ❌ ALDRI
- Natur-stock: fjell, fjorder, bjørkegrener, blader, pollen, blomster
- Frokost/mat-flatlays, vafler, bær-skåler o.l.
- Stemnings-rekvisitter: strikkepledd, stearinlys, kaffekopper som hovedmotiv
- Generiske «livsstils»-bilder uten medisinsk relevans

## ⚠️ KLINIKKBILDER: PARKERT (per Kaviyan, aug 2026)
Bilder av selve klinikken/kontoret brukes IKKE inntil videre — verken AI-genererte (forbudt) eller ekte (venter på foto fra Google Business-profilen). Når ekte foto leveres (Drive eller repo), pusses de opp og tas i bruk. Frem til da: bruk kategoriene 2–6 under.

## ✅ ALLTID (velg fra disse kategoriene)
1. ~~Klinikk-miljø~~ — PARKERT, se over
2. **Lege–pasient**: samtale, undersøkelse, lytting (AVIDA: anonymt/rygg/hender)
3. **Pasient kjenner på symptom**: hånd mot tinning (hodepine), skjelvende hånd, trett person ved skrivebord — gjenkjennbart og relevant
4. **Anatomi-visualisering**: hjerne, nervesystem, nevroner/synapser, celler — elegant medisinsk illustrasjon i brand-farger
5. **Velvære/behandling**: rolig behandlingssituasjon, telehelse-skjerm, medisinsk utstyr pent fremstilt
6. **Medisinsk-grafisk**: blodsukkerkurver, pulslinjer, medisinske ikoner — data visualisert vakkert

## Test før generering
«Ville en pasient som vurderer nevrolog-time umiddelbart forstå at dette er en klinikk?» Hvis nei → forkast motivet.

## Teknisk (fra bloom-format-analyse.md)
- Eksakt brand-hex i prompten (terrakotta #DF7F4D, nær-svart #292420, fersken #FAEADB, mint #DCEDE3, skoggrønn #21402F)
- 9:16 = 1152×2048 standard · «no real faces» for AVIDA · nedre tredjedel ren for stickers
- Bruk scraped-fotoene (ekte klinikkbilder fra nettsiden) som referansebilder i Bloom

---
# AMENDMENT (loop-batch-enforcer §1) — utvidet kanon

## §1.1 Utvidet blokkliste (hard reject, G6)
Alt over PLUSS: pollen/gress/blomstereng som motiv (selv i pollen-sesonginnhold — bruk pasient som gnir øynene / immunrespons-visualisering) · ALL mat som hovedmotiv · blodtrykksmåler-stock og klisjé-apparatbilder uten menneske · generiske naturbilder uansett årstid · såpe/spa-rekvisitter · tomme interiører · frittstående apparater.

## §1.2 Positiv kanon (det Bloom/Kling SKAL lage)
1. **Anatomi-visualisering**: hjerne, nervebaner, muskulatur, ledd — stilisert i brand-palett, editorial 3D/illustrativ, aldri skummel
2. **Celle-/mikronivå**: nevroner, synapser, signalveier — samme varme grade
3. **Pasient merker symptom**: hånd mot tinning/nakke/kne, person som kjenner etter — ekte mennesker, varmt lys
4. **Lege/pasient-interaksjon**: konsultasjon, undersøkelse, videolege, forklaring med modell i hånd
5. **Klinisk velvære**: behandlingsrom/klinikkdetaljer KUN med menneske eller medisinsk element til stede (NB: bilder av VÅR klinikk er parkert — gjelder generiske kliniske miljøer)

## Bloom prompt-prefix (obligatorisk)
"warm editorial medical illustration OR clinical photography; anatomy/cellular visualization in cream-amber-green brand palette, or real people noticing symptoms / doctor-patient interaction. NEVER: food, nature scenery, pollen, candles, spa props, empty interiors, standalone devices."

## Sesongregel (enforcer §6)
Sesong påvirker TEMA og COPY — aldri bildemotiv. «Pollensesong» → pasient som gnir øynene eller immunrespons-visualisering, ALDRI pollen/gress.
