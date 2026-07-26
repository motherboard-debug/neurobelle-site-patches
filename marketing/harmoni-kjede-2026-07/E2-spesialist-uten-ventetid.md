# E2 · «Spesialist uten lang ventetid» — verktøy-i-harmoni-eksempel

Fra idébanken (E2), direkte kontring til Dr.Dropin sin «time på dagen»-posisjonering.
Dette er det første fulle Bloom→Canva(→HeyGen)-eksempelet i denne prosessen.

## Canva (ferdig)
- **Brand kit brukt:** «Neurobelle Klinikk» (ekte kit funnet i Canva-kontoen, `kAHMIqL9Ins`) — egne farger/fonter fra Canva, ikke bare hardkodet hex i prompten.
- **Design:** https://www.canva.com/d/tpnP6SFQasuJz1a (rediger) · https://www.canva.com/d/rv1B4j_l2wQUuUX (se)
- **Format:** Instagram/Facebook Story (9:16)
- Canva-generering rapporterte `status: success`. **Merk:** Egress-proxyen i dette miljøet blokkerer Canva sitt CDN-domene for automatisk nedlasting/pixel-verifisering (samme blokk som Bloom sitt CDN) — jeg har ikke selv sett sluttresultatet, kun bekreftet at generering + lagring til kontoen lyktes. Åpne redigeringslenken for å se og godkjenne.
- Bloom-heroet (kalender/klokke-ikon-konsept) kunne ikke brukes direkte i Canva: Bloom sin bilde-URL krever autentisering og er ikke faktisk offentlig tilgjengelig, så Canva-uploaderen (som bare aksepterer ekte offentlige URL-er — riktig sikkerhetsdesign) avviste den. Canva sin egen AI-generering brukte konseptet i tekstform i stedet.

## HeyGen HyperFrames (pågår)
- Full branded motion-graphics-versjon (5 scener, ~17,5 sek, stille) bygges lokalt via de installerte HyperFrames-skillene (siden hostet compose er deaktivert for CLI-agenter) i `marketing/hyperframes-2026-07/E2-spesialist-uten-ventetid/`.
- Kjøres i bakgrunnen av en dedikert Builder-subagent som følger `motion-graphics`/`hyperframes-core`/`motion-doctrine`-kontraktene (lint → check → snapshots → render til MP4).
- Status ved skriving: **under bygging** — oppdateres når agenten er ferdig.

## Bloom
- Heroet (`8917b3b4-aabe-4908-9ef2-584b050793c1`) er generert og ligger i Bloom-galleriet, men endte ikke i Canva-designet av grunnen nevnt over.
- Credits brukt denne runden: 1 (balanse nå: 1).
