# BATCH-RAPPORT — august-batch-content
**Kjøring:** 2026-08-06 natt → 2026-08-07 formiddag (§5-korreksjon + Kaviyans v2-runde)
**Revisjon:** RØD på ett punkt (HeyGen-kvote, pengeblokkert) — alt annet GRØNT.
25/25 videoer oppfyller video-definisjonen. Manifest ↔ disk 1:1 (156 assets, 0 spøkelser).

## Kaviyans tilbakemeldinger — alle implementert
| Beskjed (via mappenavn/chat) | Status |
|---|---|
| Fjern «AVIDA» fra alle slides | ✅ 10 forsider renset |
| Ny logo: Neuro svart/lys + belle. oransje, lett snitt (referansebilde) | ✅ 96 slides + 14 stills + intro/CTA-kort, Playfair 500 |
| Stemmen låt dansk → norsk | ✅ Stemme B valgt: PVC-stemmen på turbo-modell m/ tvunget norsk (`language_code=no`) |
| Fjern captions på video (tekst finnes i bildet) | ✅ Alle 25 videoer uten caption-plater |
| Story-motion: musikk i stedet for stemme | ✅ 10 SM med ElevenLabs Music (energisk/beroligende), audit-spec oppdatert |
| Video-«tremor» (risting) | ✅ 4× supersamplet zoompan + roligere zoom |
| Kling «urealistisk» | ✅ AI-hjerne vraket; lege–pasient + kvinne/tinning + hånd + nevroner |
| S5-punktene stygge | ✅ Ny stil: «1. 2. 3. 4.» i terrakotta serif, luftig |
| S4-fotologo | ✅ Myk mørk gradient + ren logo uten kontur |
| Canva for mørke/firkantede | ✅ 4 nye LYSE design (off-white/fersken/mint, mørk tekst, terra-aksenter) |
| Captions for FB/IG + spredning utover august | ✅ `captions-plan-august.md` (59 poster, 09.08–03.09) |

## Produsert innhold (manifest: 156 assets)
| Kategori | Antall | Lyd | Merknad |
|---|---|---|---|
| Karuseller (K01–K16) | 96 slides | – | Avida fjernet, ny logo, ny S5-stil, S4-foto renset |
| Reels (R_/HF_/AVIDA_) | 13 | VO stemme B | 26–35 s, intro + original + stills + CTA |
| Kling motion-reels | 2 | VO stemme B | KLING_hjernen (lege-pasient + nevroner), KLING_signal (tinning + hånd) |
| Story-motion (SM01–10) | 10 | Musikk | 26 s, energisk (7) / beroligende (3) |
| Stories-stills | 14 | – | Ny logo |
| Canva-design | 4 | – | Lys v2-stil, eksportert PNG 1080×1350 |
| VO-filer (separate) | 17 | stemme B | `vo/` — Kaviyan kan bytte lyd selv |
| Musikk-referanser | 2 | – | i produksjonspipeline (scratch), bakt inn i SM |

## Kvoter (audit.py §3.4)
- kling: **2/2** ✅ · canva: **4/4** ✅ · bloom: **0 % (cap 40)** ✅ · VO-dekning: **25/25** ✅
- heygen: **0/2** ❌ — avatarene «Kaviyan» finnes, men API-wallet = $0 og generering
  avvises (`insufficient_credit`). Påfyll = betaling → aldri autonomt. Se `AVVIK-HEYGEN.md`.
  Pipeline er klar; si fra når wallet er fylt, så leveres 2 avatar-reels samme dag.

## Kostforbruk (denne kjøringen)
| Motor | Forbruk |
|---|---|
| fal.ai Kling | 7 klipp × $0.28 = **$1.96** (grense $3/dag; 2 klipp vraket i kvalitetskontroll) |
| ElevenLabs TTS | ~44 genereringer (27 natt + 17 stemme B) + 3 stemmeprøver ≈ 26k tegn |
| ElevenLabs Music | 2 × 30 s spor |
| Canva | 0 kr (Pro-abonnement), 9 design-generasjoner + 1 dokument bygget via API |
| HeyGen | $0 (blokkert) |

## «Publiser først»-anbefaling
1. **K13-august-rutine** (karusell) — sesongknagg, bred appell, 09.08
2. **R_livsstil** (reel m/ ny stemme) — varm intro til stemmen
3. **KLING_signal** — sterkeste visuelle, midt i migrene-uken (15.08)
Full rekkefølge: `captions-plan-august.md`.

## Kjente rester
- HeyGen 0/2 (over) → audit RØD → `usb-sync.py` nekter leveranse til USB inntil
  grønn (eller kvote-endring fra Kaviyan i `motherboard/enforcer/audit.py`).
- Original-klippene inne i HF-reelene bærer sin gamle innbakte logo (rammes inn
  av ny logo i intro/stills/CTA). Full re-render av HF-grafikk = egen jobb.
- `synapse_signal`-klippet (Kling) ble vraket som «rart» — ligger i
  `_system/testklipp/fal/` om Kaviyan vil vurdere selv.
- Meta Business Suite-opplasting: se egen status i Telegram/chat — captions
  ligger klare i `captions-plan-august.md`; Kaviyan godkjenner captions før
  første post går live.
