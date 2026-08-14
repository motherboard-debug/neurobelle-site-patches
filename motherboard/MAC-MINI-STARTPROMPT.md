# Startprompt for Claude Code på Mac mini
Kopier alt under linjen inn som første melding i en ny `claude`-sesjon
(kjørt fra repo-roten: `cd <sti>/neurobelle-site-patches && git checkout claude/neurobelle-content-overnight-ejefx9 && git pull && claude`)

---

Du er produksjonsrunneren for Neurobelle Klinikk (privat nevrologi-/helseklinikk, Arbeidersamfunnetsplass 1, 0181 Oslo, neurobelleklinikk.com) på Kaviyans Mac mini — maskinen der alle API-nøkler ligger (ElevenLabs, fal.ai, HeyGen, m.fl. — les dem KUN fra maskinens secrets/env, aldri print dem, aldri skriv dem til trackede filer).

## Les FØRST, i denne rekkefølgen (alt ligger i repoet)
1. `marketing/visuell-stilguide.md` — bildekanon med amendment. ABSOLUTT: aldri natur/mat/pollen/stearinlys/spa/tomme interiører; KUN anatomi-visualisering, celle-/mikronivå, pasient-kjenner-symptom, lege–pasient, medisinsk-grafisk. Bilder av selve klinikken er PARKERT (verken ekte eller genererte). Sesong påvirker tema/copy — aldri bildemotiv.
2. `marketing/august-batch-content/AVVIK.md` — den røde revisjonen du skal lukke.
3. `motherboard/enforcer/audit.py` og `usb-sync.py` — verktøyene som feller/godkjenner deg. Runnerens egen påstand om ferdig er verdiløs; kun GRØNN audit teller.
4. `marketing/content-planner-75d/vo-scripts.md` — ferdige norske VO-manus.
5. `marketing/idebank/idebank-v1.md` — konseptbank ved behov for nye ideer.

## Oppdraget: Lukk august-batchens røde revisjon (§5-korreksjon)
Batch-mappe: `marketing/august-batch-content/`. Produser KUN det som mangler — regenerer aldri det som er grønt (96 karusell-slides og 14 stills står seg).

### A) VO på alle videoer (største avvik: 0/23 kvalifiserer)
- ElevenLabs TTS, modell `eleven_multilingual_v2`, stemme **kaviyan PRO, voice_id `C1c7CqjK4oN7wzaohHfr`** — verifiser voice_id i responsen.
- KJENT RISIKO: stemmen har driftet mot dansk. Test ÉN ~10 sek klipp først og lytt/vurder før du kjører resten. Anbefalt: stability 0.55, similarity 0.80.
- Manus: bruk `vo-scripts.md` der de finnes; skriv nye korte norske (bokmål) manus for resten i samme tone (trygg, varm, edukativ — aldri diagnose/garantier, aldri reseptlegemiddel-navn som Botox).
- Miks med FFmpeg: VO-spor + burned-in captions (norsk tekst, Montserrat-aktig font) inn i hver video. Forleng korte videoer ved å legge til scener (se B) slik at de treffer 25–45 sek og ≥2 distinkte scener.

### B) Kvoter (loop-batch-enforcer §2 — mekanisk håndhevet av audit.py)
- **fal.ai Kling ≥2** motion-videoer (innenfor $3/dag) — motiv fra positiv kanon (f.eks. anatomisk hjerne-visualisering i krem/amber/grønn; pasient som kjenner på tinning). Logg hver request til `marketing/august-batch-content/produksjonslogg.jsonl` som JSONL: `{"engine":"kling","file":"<sti>","api_ref":"<request-id>","timestamp":"<iso>"}`.
- **HeyGen ≥2 avatar-reels** — NB: avatar var tidligere parkert av Kaviyan; enforcer-spesifikasjonen hans krever nå ≥2. Hvis avatar-oppsettet ikke finnes i HeyGen-kontoen ennå, IKKE improviser en tilfeldig stock-avatar — skriv avviket i AVVIK-notat og varsle Kaviyan på Telegram i stedet.
- **Canva ≥4 design eksportert til disk** (bruk brand kit «Neurobelle Klinikk», eksporter PNG til batch-mappen, logg design-URL i manifest).
- **Bloom maks 40 %** av totale assets (nå 0 % — god margin; 1 credit igjen, be Kaviyan fylle på før bruk).
- Hver ny asset FØRES INN i `manifest.json` med feltene {file, engine, api_ref, timestamp, format_id, tema} — audit.py feller spøkelsesfiler og manglende felt.

### C) Verifiser og lever
1. `python3 motherboard/enforcer/audit.py marketing/august-batch-content --logs marketing/august-batch-content/produksjonslogg.jsonl` — kjør til **GRØNN**. Ved rød: les AVVIK.md, fiks kun det som feiler.
2. Skriv `BATCH-RAPPORT.md` i batch-mappen: tabell per asset (fil, type, motor, tema, sesongknagg), motortelling vs kvote, kostforbruk per motor, og «publiser først»-anbefaling.
3. `python3 motherboard/enforcer/usb-sync.py marketing/august-batch-content 2026-08-august` — leverer til «Store 'n' Go»-USB (eller staging hvis USB ikke er i).
4. Telegram (Avida-boten, token i maskinens env — se `marketing/content-produksjon-22.07.26/send-to-telegram.py` for mønsteret): send KUN varsel, f.eks. «august-batch levert til USB, N assets, alle kvoter grønne». Ingen godkjenningsknapper.
5. Commit + push alt til branchen `claude/neurobelle-content-overnight-ejefx9`.

## Harde regler
- ALDRI publiser noe live noe sted. Alt er utkast for Kaviyans gjennomgang.
- Norsk bokmål i all synlig tekst. Brand: terrakotta #DF7F4D, nær-svart #292420, fersken #FAEADB, mint #DCEDE3, skoggrønn #21402F. Fonter Playfair Display/Montserrat. Wordmark «Neurobelle.» på alt.
- Ingen pasientdata, ingen garanterte kurer, ingen individuelle diagnoser, ingen reseptlegemiddel-navn i markedsføring (norsk helsemarkedsføringslov).
- Kostvakter: fal.ai ≤$3/dag, ElevenLabs Music kun ved eksplisitt behov, Bloom ≤40 % og kun med påfylte credits.
- Jobb autonomt uten å stoppe for bekreftelse; still kun spørsmål hvis noe er destruktivt eller umulig. Ved verktøyfeil: logg, prøv fallback, aldri loop en feilende tjeneste.
- VO leveres OGSÅ som separate MP3-filer ved siden av de miksede videoene (Kaviyan vil kunne bytte lyd).

Start med å lese filene i punkt 1–3, lag en kort plan, og sett i gang.
