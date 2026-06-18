# /loop — Neurobelle gap-check (selvkjørende prompt)

Kjør denne på nytt når som helst (lim inn, eller `/loop <innholdet under>`) for å få en fersk
«hva mangler / hva trengs» og for å la agenten gjøre ferdig alt som er innenfor egen kontroll.
Loopen er **konvergerende**: den stopper når alt agent-styrt er gjort og resten kun venter på Kaviyan.

> Begrensning som må respekteres: agenten kan IKKE se live-siden, GBP, Altinn eller katalogene
> (egress er blokkert). Den kan derfor ikke *observere* Kaviyans fremgang — den re-differer mot
> kjente statusfiler og mot det Kaviyan forteller. Ingen falske «verifisert live»-påstander.

---

## PROMPT (dette er loopen)

```
Du er SEO-gap-tracker for neurobelleklinikk.com. Gjør én iterasjon nå:

1. LES gjeldende status i repoet:
   - seo/NESTE-STEG.md          (Kaviyans steg-for-steg)
   - seo/to-approval.md          (Kaviyan-blokkerte punkter)
   - seo/research-report.md      (planen + KPI-er)
   - seo/scorecard.md            (før/etter)
   Og vurder mot det Kaviyan sist har fortalt i chatten (publisert? logget inn? URL-er?).

2. PRODUSER en kort, ærlig gap-rapport i tre bøtter:
   ✅ GJORT (eller venter bare på Googles auto-godkjenning)
   🔑 VENTER PÅ KAVIYAN (innlogging/BankID/manuelt — list eksakt hva å klikke)
   🛠️ INNENFOR AGENTENS KONTROLL (kan gjøres nå uten Kaviyan)

3. GJØR FERDIG alt i 🛠️-bøtta denne iterasjonen (skriv innhold, patch schema, lag prompts,
   render mockups, kjør driveren) og commit hver endring. Compliance-vakt: ingen merkenavn
   på legemidler, ingen garantier, hyperhidrose/migrene = medisinsk.

4. OPPDATER seo/NESTE-STEG.md hvis noe har endret seg.

5. STOPP-betingelse: hvis 🛠️-bøtta er tom (alt agent-styrt er gjort) OG resten kun er
   🔑-blokkert på Kaviyan → rapportér «konvergert», ikke planlegg ny runde.
   Ellers: si hva du gjorde, og at neste runde fortsetter med resten.

Kjente faste punkter (oppdater status hver runde):
- 🔑 Brønnøysund/Altinn: rett adresse til Arbeidersamfunnets plass 1, 0181 Oslo (rotårsak for kataloger)
- 🔑 legelisten.no: send e-posten i NESTE-STEG.md
- 🔑 Publiser 10 bloggposter (seo/ready-to-publish/blog/all-blog-posts.md)
- 🔑 Fiks 2 interne lenker på /hyperhidrose-oslo
- 🔑 GBP: bilder + første GBP-innlegg + samle anmeldelser
- 🔑 1881/gulesider/proff: claim (eller vent på Brønnøysund-propagering)
- 🔑 Facebook: døp om fra «Monalisa-KlinikkenAkademiet»
- 🛠️ Når Kaviyan sender GBP/Facebook/legelisten-URL-er → legg inn som sameAs i bump-cache.sh schema
- 🛠️/🔑 GA4-oppsett (agenten kan skrive stegene; Kaviyan kobler til)
- 🛠️ Resterende tjenestesider: samme design som seo/mockups/hyperhidrose-oslo.html
```

---

## Hvordan kjøre den som en EKTE recurring loop
Dette miljøet mangler ScheduleWakeup/cron, så den kan ikke fyre av seg selv her. Tre måter:
1. **Manuelt:** lim inn PROMPT-blokken over når du vil ha en oppdatering.
2. **`/loop 1d <prompt>`** i et miljø der cron-verktøyet finnes (daglig kadens passer — arbeidet ditt tar dager).
3. **Hendelsesdrevet (best):** si «oppdatering: X er gjort» i chatten — da re-differer agenten umiddelbart
   og gjør ferdig nye ting som ble låst opp.
