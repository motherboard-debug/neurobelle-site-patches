# AVVIK: HeyGen-kvoten (2 avatar-reels) kan ikke oppfylles autonomt

**Dato:** 2026-08-07 (natt-kjøring, §5-korreksjon)

## Hva som ble sjekket
- HeyGen-kontoen (kaviyan@kkhold.com) har avatar-oppsettet på plass:
  to «Kaviyan»-avatarer (id `767d5461…` og `19fb3a3c…`) + talking photos.
- API-wallet: **$0.00**, auto-reload av (`GET /v3/users/me`).
- Reelt generate-forsøk (test-modus, Kaviyan-avatar): **HTTP 402
  `insufficient_credit`** — «Insufficient credits. Upgrade to continue.»

## Hvorfor det stopper her
Påfyll av HeyGen-wallet er en betaling. Hard-regel #1 i CLAUDE.md:
betalinger initieres aldri autonomt. Kvoten «heygen ≥2» i audit.py §3.4
kan derfor ikke lukkes i denne kjøringen.

## Hva som trengs for å lukke avviket
1. Kaviyan fyller på HeyGen-wallet (eller aktiverer plan med API-kreditt).
2. Gi beskjed — avatar-reels-pipelinen er klar: VO-spor (`vo/VO_AVATAR_velkommen.mp3`,
   `vo/VO_AVATAR_videotime.mp3`) genereres på valgt stemme, lastes opp som audio-asset,
   avatar-video genereres med Kaviyan-avataren, bygges inn i reel-rammen
   (intro + avatar + CTA) og føres i manifest + produksjonslogg.

## Konsekvens for revisjonen
`audit.py` vil vise RØD på «3.4 KVOTE heygen: 0/2» til punktene over er løst.
Alle andre krav håndteres i denne kjøringen.
