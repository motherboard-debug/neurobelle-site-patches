# Bloom – formatanalyse & opprydding (aug 2026)

## 📍 Hvor bildene ligger
Alle Bloom-bilder ligger i **Bloom-galleriet** under workspace **«Kaviyan's Team»** → logg inn på **trybloom.ai** og åpne brand «Neurobelle». Hvert bilde har direktelenke `trybloom.ai/img/<id>` (krever innlogging — derfor kan de ikke autolastes ned fra cloud-miljøet eller limes inn i Canva som URL).

## 🗑 Opprydding utført
- **Slettet: 42 gamle u-godkjente bilder** (12. juni – 5. juli, fra tidligere økter): «warm editorial photograph»-serien (~30 fotocovers), gamle kampanjecovers («Vekttap som faktisk varer», «God tid. Grundig vurdering» osv.), engelskspråklige utkast og recreate-tester.
- **Beholdt: 17 nåværende stagede** (22. juli+): 11 story-illustrasjoner batch 1, 4 nye-pilar-stories (hjernetåke/hukommelse/utbrent/søvnløs), 1 kalender-hero, 1 16:9-illustrasjon (29. juli).
- **Beholdt: hele scraped-biblioteket** (6 ekte foto fra nettsiden — telehelse-laptop, lege+pasient, sprøyte, vektmåling, estetikk, kvinne i sol) — dette er referansematerialet som forbedrer fremtidige genereringer.

## 📐 Formatene (lært av 59 bilder)

### Faste output-dimensjoner (2K-tier)
| Aspect | Piksler | Bruk |
|--------|---------|------|
| **9:16** | 1152×2048 | Stories/reels-covers — 51 av 59 bilder, standardformatet |
| **4:5** | 1632×2048 | Feed-poster/karuseller |
| **16:9** | 2048×1152 | Blogg/web-hero |
| **3:2** | 2048×1360 | Web-hero bred |
(Eldre unntak: 2160×3840 fra 4K-tier.)

### Bloom legger AUTOMATISK på (uten at prompten ber om det)
1. **«Neurobelle.»-wordmark** — serif, plassert topp/venstre eller topp/senter
2. **Brand-fargene** fra sin egen analyse: krem `#F9F6EF`, brent oransje `#DC7E3A`, dyp plomme `#2E0B3A`, `#3E3E3E`, gull `#E0C68A` — NB: dette er Blooms *auto-ekstraherte* palett fra nettsiden, som avviker litt fra vår offisielle (terrakotta #DF7F4D osv.). Vil du ha eksakt hex, må det stå i prompten (det gjorde vi i juli-batchen — da treffer den).
3. Serif-overskrift + sans-brødtekst (matcher Playfair/Montserrat-følelsen)
4. Ofte footer-URL og ikonrekker på cover-stil-bilder

### To stilfamilier i biblioteket
**A) Foto-editorial covers** (den slettede gamle serien): varmt gyllent lys, anonyme personer (hender/rygg/silhuett), norsk serif-headline bakt inn, footer-URL. Fotorealistisk, «kampanjecover»-følelse.
**B) Flat illustrasjon/infografikk** (nåværende stagede batch): brand-hex eksplisitt i prompt, line-art-ikoner, stor serif-tittel + underlinje, **nedre tredjedel holdt ren for stickers**. Denne stilen matcher HyperFrames-reelene og den lokale designmotoren → helhetlig feed.

### Prompt-oppskrift som fungerer (lært av treffene)
```
Vertical 9:16 Instagram Story. [bakgrunn med eksakt hex]. [ett tydelig
line-art-motiv, ingen identifiserbare ansikter]. Elegant serif headline:
"[norsk tittel]". Smaller line: "[norsk undertekst]". Leave lower third
clean for a sticker. Calm, editorial, medical-brand feel. No real faces.
```
– Eksakt hex i prompt → riktige farger. – «No real faces» → AVIDA-trygt. – Norsk tekst i anførselstegn gjengis som regel korrekt (kontrolleres alltid).

## Status
Bloom-credits: **1 igjen** — fyll på før neste fotobatch.
