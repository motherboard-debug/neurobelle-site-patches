# VO-scripts – Neurobelle Klinikk

> **Stemme:** `kaviyan PRO` (ElevenLabs-stemmeklone)
> **Modell:** `eleven_multilingual_v2`
> **Leveranse:** Separat MP3-fil per script. ALDRI bakt inn i video.
> **Paring:** Hvert reel-nummer under samsvarer med dag i planner-75d.md

---

## Script 1 – R1 – Healthy Living (Dag 3)
**Pool:** KLINIKK
**Omtrent varighet:** ~32 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_01_r1_kaviyan_pro.mp3`

```
Hva om ett enkelt valg kunne forandre hele helsen din?

Kroppen vår er bygget for bevegelse, for frisk luft, for ekte mat.
En liten spasertur. Et sunt måltid. En god natts søvn.

Det er ikke komplisert – men det krever at vi faktisk prioriterer det.

Hos Neurobelle er vi her for å støtte deg på den reisen.
Enten du ønsker en helsesjekk, veiledning om livsstil eller bare vil vite at du er på rett spor.

Neurobelle – bestill time nå.
```

---

## Script 2 – R2 – Sick at Home (Dag 7)
**Pool:** KLINIKK
**Omtrent varighet:** ~22 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_02_r2_kaviyan_pro.mp3`

```
Du trenger ikke gå ut når du er syk.

Det finnes en enklere vei. Book en videokonsultasjon hos Neurobelle,
og snakk med legen din direkte fra sofaen.

Ingen ventetid. Ingen smittefare på venteværelset.
Digital resept klar innen minutter.

Fordi helse ikke bør vente – selv ikke på en dårlig dag.

Neurobelle – bestill time nå.
```

---

## Script 3 – R3 – Klinikk → Telehelse (Dag 14)
**Pool:** KLINIKK
**Omtrent varighet:** ~25 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_03_r3_kaviyan_pro.mp3`

```
Noen ganger er det best å møtes ansikt til ansikt.
Andre ganger er det enklere hjemmefra.

Hos Neurobelle har du begge mulighetene.

Vår klinikk på Arbeidersamfunnetsplass i Oslo er alltid klar for deg.
Og med videokonsultasjon kan du møte din lege fra hvilken som helst plass i Norge.

Profesjonell helsehjelp – på dine premisser.

Neurobelle – finn oss når det passer deg.
```

---

## Script 4 – R4 – Tremors (Dag 21)
**Pool:** KLINIKK
**Omtrent varighet:** ~28 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_04_r4_kaviyan_pro.mp3`

```
Har du lagt merke til at hånden din skjelver mer enn den pleide?

Skjelvinger kan ha mange årsaker.
For noen er det stressrelatert. For andre er det et nevrologisk signal.

Uansett årsak – det er noe kroppen din prøver å fortelle deg.

En nevrologisk utredning kan gi deg svar.
Og med svar kommer muligheten til å gjøre noe med det.

Ikke ignorer signalene. Ta kontakt med Neurobelle i dag.
```

---

## Script 5 – R5 – Migraine (Dag 28)
**Pool:** AVIDA
**Omtrent varighet:** ~28 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_05_r5_kaviyan_pro.mp3`

```
Mørkt rom. Gardiner for. Klokken er midt på dagen,
men du kan ikke se på lyset.

Migrene er ikke bare hodepine.
Det er timer – noen ganger dager – der livet settes på pause.

Men det finnes hjelp.

Nevrologisk utredning kan avdekke hva som utløser anfallene dine,
og åpne for behandling som faktisk virker.

Du trenger ikke lide alene.

Neurobelle – vi hjelper deg å finne veien tilbake til hverdagen.
```

---

## Script 6 – AVIDA-1 – Forebygging (Dag 11)
**Pool:** AVIDA
**Omtrent varighet:** ~30 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_06_avida-1_kaviyan_pro.mp3`

```
Hva om du kunne unngå sykdom – før den i det hele tatt starter?

Forskning viser at livsstilsvalg kan forebygge opptil 80 prosent av hjerte- og karlidelser
og redusere risikoen for nevrologiske plager betydelig.

Bevegelse. Søvn. Kosthold. Stresshåndtering.

Det høres enkelt ut – men det krever bevissthet og noen ganger profesjonell veiledning.

Hos Neurobelle er vi her for å hjelpe deg ta de riktige valgene.

Fordi den beste medisinen er den du aldri trenger å ta.
```

---

## Script 7 – AVIDA-2 – Hodepine vs Migrene (Dag 18)
**Pool:** AVIDA
**Omtrent varighet:** ~30 sekunder ved normalt taletempo
**Fil som skal genereres:** `vo_07_avida-2_kaviyan_pro.mp3`

```
Alle har hodepine innimellom. Det er normalt.

Men hva om smerten er intens, pulserende, og alltid på én side av hodet?
Hva om den kommer med kvalme, og gjør deg overfølsom for lys og lyd?

Da er det sannsynligvis ikke vanlig hodepine.

Migrene er en nevrologisk lidelse – og den behandles annerledes.

Å kjenne forskjellen kan bety færre anfall, bedre behandling og bedre livskvalitet.

Snakk med en lege hos Neurobelle. Det kan gjøre en stor forskjell.
```

---

## ElevenLabs API – Tekniske notater

```
Modell:   eleven_multilingual_v2
Stemme:   kaviyan PRO (hent voice_id via GET /v1/voices)
Format:   mp3_44100_128
Stability: 0.55  (ikke for lav – unngå dansk drift)
Similarity boost: 0.80
Style: 0.25

Test først: kjør Script 1 (R1) som 10-sekunders testklipp
Kontroller at stemmen låter norsk – ikke dansk – før du genererer resten.
Lydfilene legges ALDRI inn i video automatisk – brukes som separate assets.
```

### Storyboard-reels (R3, R6, R7, R8) – Produksjonsnotater

Disse reelene krever animasjon eller ekte klipp og skal **ikke** auto-genereres.
VO-scripts for disse skrives når du er klar til å produsere dem:
- **R3** – Trenger ekte klinikk-klipp og opptak av Kahiyan
- **R6** – Seigmenn-animasjon (blå figurer, vaksine-fortelling)
- **R7** – Seigmenn-animasjon (glemt medisin på tur)
- **R8** – Seigmenn-animasjon (blodsukkersvingninger)

---
*Generert av Neurobelle AI-assistent – Klare til innliming i ElevenLabs*