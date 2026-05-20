/* ============================================================
   Neurobelle — Behandlinger (treatments catalog) module
   Mounts into any page containing: <div id="nb-behandlinger"></div>
   Built for Squarespace 7.1, served via jsDelivr from
   motherboard-debug/neurobelle-site-patches@main/dist/behandlinger.js
   ============================================================ */
(function () {
  // ---------- ASSET PATHS ----------------------------------------------------
  const SCRIPT_BASE = (function () {
    const s = document.currentScript || document.querySelector('script[src*="behandlinger.js"]');
    return s && s.src ? s.src.replace(/behandlinger\.js.*$/, '') : '';
  })();
  function img(name) {
    return /^https?:/.test(name) ? name : SCRIPT_BASE + 'img/' + name;
  }

  // ---------- DOCTORS --------------------------------------------------------
  const DOCTORS = {
    giti:    { id: 'giti',    name: 'Dr. Giti Sabalani',  role: 'Allmennlege' },
    ardavan: { id: 'ardavan', name: 'Dr. Ardavan Karimi', role: 'Spesialist i nevrologi og estetisk medisin' },
    kaviyan: { id: 'kaviyan', name: 'Dr. Kaviyan Karimi', role: 'Lege, estetisk medisin og digital konsultasjon' },
  };

  // ---------- CATEGORIES -----------------------------------------------------
  const CATEGORIES = [
    { id: 'all',         label: 'Alle' },
    { id: 'allmennlege', label: 'Allmennlege' },
    { id: 'nevrologi',   label: 'Nevrologi' },
    { id: 'estetikk',    label: 'Estetikk' },
    { id: 'digital',     label: 'Digital' },
  ];

  // ---------- LANDING PAGES --------------------------------------------------
  // Each variant slug → the existing Squarespace landing page that goes deeper
  // on the treatment. Renders as "Les mer →" inside the detail/variant card.
  const LANDING_PAGE = {
    // Allmennlege variants → GP landing page
    'lege-konsultasjon': '/legekonsultasjon-oslo',
    'legetime-utvidet': '/legekonsultasjon-oslo',
    'arlig-helsesjekk': '/legekonsultasjon-oslo',
    'kontroll-og-oppflgingskonsultasjon-fysisk-oppmte': '/legekonsultasjon-oslo',
    // Vekt variants → vektreduksjon landing
    'vekt-oppstartspakke': '/vektreduksjon-oslo',
    'vekt-3-maaneders-program': '/vektreduksjon-oslo',
    // Legeattester (single) → attester landing
    'legeattester': '/attester',
    // Nevrologi variants → nevrologisk utredning landing
    'nevrologisk-undersokelse-oslo': '/generell-nevrologisk-utredning',
    'nevrologisk-oppfolgning-fysisk': '/generell-nevrologisk-utredning',
    'nevrologisk-oppfolgning-video': '/generell-nevrologisk-utredning',
    'parkinson-vurdering': '/generell-nevrologisk-utredning',
    'tremor-vurdering': '/generell-nevrologisk-utredning',
    'second-opinion-nevrolog': '/generell-nevrologisk-utredning',
    // Hodepine variants → hodepine/migrene landing
    'hodepine-migrene-utredning-oslo': '/hodepine-migrene-oslo',
    'hodepine-konsultasjon': '/hodepine-migrene-oslo',
    // Estetikk variants → estetisk klinikk landing
    'rynkebehandling-oslo': '/estetisk-klinikk-oslo',
    'filler-behandling-oslo': '/estetisk-klinikk-oslo',
    'mesoterapi-oslo': '/estetisk-klinikk-oslo',
    'tradloft-oslo': '/estetisk-klinikk-oslo',
    'hyperhidrose-behandling-oslo': '/estetisk-klinikk-oslo',
    // Digital konsultasjon variants → reseptfornyelse landing
    'lege-pa-video': '/resept-fornyelse',
    'rask-resept-digital': '/resept-fornyelse',
    'reseptfornyelse-video': '/resept-fornyelse',
    // Vaksiner (single) → vaksiner landing
    'vaksiner': '/vaksiner',
  };
  function landingPage(svc) { return LANDING_PAGE[svc.slug] || null; }

  // ---------- SERVICES (7 cards, with umbrellas for grouped treatments) ------
  // Top-level entries are either single services (price/duration/lead/sections)
  // or umbrellas (fromPrice/intro/variants[]).
  const SERVICES = [
    // ===== ALLMENNLEGE (3 cards: Allmennlege umbrella, Vekt umbrella, Legeattester) =====
    {
      slug: 'allmennlege',
      title: 'Allmennlege',
      h2: 'Allmennlegetjenester i Oslo',
      tagline: 'Fastlegekonsultasjon, helsesjekk og oppfølging',
      category: 'allmennlege',
      fromPrice: '450,-',
      duration: 'Varierer',
      image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/082ef587-2688-4c78-8e68-018b209e5ce0/sjekk.jpg',
      intro: 'Privat fastlege i Oslo sentrum uten lang ventetid — grundige konsultasjoner, oppfølging av kroniske tilstander, og årlige helsesjekker.',
      variants: [
        {
          slug: 'lege-konsultasjon',
          title: 'Lege konsultasjon',
          tagline: 'Grundig vurdering av alminnelige helseplager',
          price: '450,-',
          duration: '20 min',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/082ef587-2688-4c78-8e68-018b209e5ce0/sjekk.jpg',
          lead: 'Vurdering hos lege for alminnelige helseplager — forkjølelse, hudplager, mageplager, kroniske tilstander, og det meste som ellers håndteres hos fastlegen. Inkluderer eventuell resept, henvisning eller prøvetaking.',
        },
        {
          slug: 'legetime-utvidet',
          title: 'Lege konsultasjon (utvidet)',
          tagline: 'Lengre time for sammensatte plager',
          price: '800,-',
          duration: '30 min',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/082ef587-2688-4c78-8e68-018b209e5ce0/sjekk.jpg',
          lead: 'En lengre konsultasjon (30 min) for sammensatte plager, kompleks sykehistorie, eller når du trenger ekstra tid hos legen. Skriftlig oppsummering inkludert.',
        },
        {
          slug: 'arlig-helsesjekk',
          title: 'Årlig helsesjekk',
          tagline: 'Grundig gjennomgang av din helse',
          price: '900,-',
          duration: '45 min',
          doctors: ['giti'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/19e20bc8-8e76-4456-8186-e8a0b2bdd0d1/sjekk.jpg',
          lead: 'Blodprøver, blodtrykk, BMI, puls + gjennomgang av søvn, kosthold, mosjon og stressnivå. Du går herfra med skriftlig oppsummering og konkrete anbefalinger.',
        },
        {
          slug: 'kontroll-og-oppflgingskonsultasjon-fysisk-oppmte',
          title: 'Kontroll og oppfølging',
          tagline: 'Oppfølging av kronisk tilstand eller pågående behandling',
          price: '1 000,-',
          duration: '30 min',
          doctors: ['giti'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/6b1f86e1-d5a7-4f6f-8a3d-a78d171ba5b0/nevro+und+2.jpg',
          lead: 'For deg som er under utredning eller behandling for en kjent tilstand — diabetes, høyt blodtrykk, kronisk smerte, post-operativ oppfølging eller annen pågående plan. Vi gjennomgår status, justerer plan og resepter ved behov.',
        },
      ],
    },
    {
      slug: 'vekt-og-livsstil',
      title: 'Vekt og livsstil',
      h2: 'Vekt og livsstilskonsultasjon i Oslo',
      tagline: 'Medisinsk vektreduksjon med tett oppfølging',
      category: 'allmennlege',
      fromPrice: '700,-',
      duration: 'Varierer',
      image: 'overvekt.jpg',
      intro: 'Strukturert tilnærming til vektreduksjon — fra første kartlegging til langsiktig oppfølging med medisinsk støtte ved behov.',
      variants: [
        {
          slug: 'vekt-oppstartspakke',
          title: 'Oppstartspakke',
          tagline: 'Kartlegging + individuell plan',
          price: '700,-',
          duration: '45 min',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'overvekt.jpg',
          lead: 'Grundig kartlegging av vektutvikling, kosthold, aktivitetsnivå, søvn og eventuelle underliggende medisinske årsaker. Inkluderer blodprøver ved behov og skriftlig plan med oppfølgingsanbefaling.',
        },
        {
          slug: 'vekt-3-maaneders-program',
          title: '3-måneders program',
          tagline: 'Strukturert oppfølging over 3 måneder',
          price: '3 000,-',
          duration: 'Program 3 mnd',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'overvekt.jpg',
          lead: 'Førstekonsultasjon + 3 oppfølgingstimer (video eller fysisk), løpende justering av plan og vurdering av medisinsk behandling om aktuelt. For deg som vil ha tett støtte over tid for varig resultat.',
        },
      ],
    },
    {
      slug: 'legeattester',
      title: 'Legeattester',
      h2: 'Legeattester i Oslo — rask vurdering og dokumentasjon',
      tagline: 'Attester for skole, jobb, idrett, forsikring og mer',
      category: 'allmennlege',
      price: '450,-',
      duration: '20 min',
      doctors: ['giti', 'ardavan', 'kaviyan'],
      image: 'henvisning.jpg',
      lead: 'Vi utsteder legeattester for skole, arbeid, idrett, forsikring og andre dokumentasjonsbehov. Vurderingen gjøres etter konsultasjon — noen attester krever fysisk oppmøte, andre kan ordnes digitalt.',
      sections: {
        forHvem: 'Voksne som trenger en attest fra lege til konkret formål — skole, jobb, sport, idrett, kjøreskole, eller andre dokumentasjonsbehov.',
        slikForegar: 'Du forklarer hva slags attest du trenger i bookingen. Vi gjør nødvendig vurdering og utsteder attesten samme dag, eller etter eventuelle supplerende undersøkelser. 20 minutter.',
      },
    },

    // ===== NEVROLOGI (1 card: comprehensive umbrella) =====
    {
      slug: 'nevrologi',
      title: 'Nevrologi',
      h2: 'Privat nevrolog i Oslo — utredning, oppfølging og spesifikke tilstander',
      tagline: 'Hodepine, Parkinson, tremor, second opinion og oppfølging',
      category: 'nevrologi',
      fromPrice: '1 000,-',
      duration: 'Varierer',
      image: 'parkinson.jpg',
      intro: 'Komplett tilbud innen privat nevrologi i Oslo — uten henvisning og uten ventetid. Fra full utredning og oppfølging av kjente tilstander, til hodepine, migrene, Parkinson, tremor og uavhengig second opinion.',
      variants: [
        {
          slug: 'nevrologisk-undersokelse-oslo',
          title: 'Nevrologisk utredning',
          tagline: 'Grundig førstegangsutredning hos spesialist',
          price: '2 510,-',
          duration: '60 min',
          doctors: ['ardavan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/c911d3d7-d158-45fa-b7e9-fdafb1d4a8cb/nevro+under.jpg',
          lead: 'Privat nevrologisk utredning — grundig anamnese, klinisk undersøkelse og plan for videre tester (EMG, MR, blodprøver) ved behov. Egnet for nummenhet, prikking, svimmelhet, tremor, kraftnedsettelse eller andre symptomer fra nervesystemet.',
        },
        {
          slug: 'nevrologisk-oppfolgning-fysisk',
          title: 'Nevrologisk oppfølgning (fysisk)',
          tagline: 'For deg med kjent utredet nevrologisk tilstand',
          price: '1 500,-',
          duration: '40 min',
          doctors: ['ardavan'],
          image: 'parkinson.jpg',
          lead: 'Oppfølgingstime hos nevrolog for pasienter med allerede utredet nevrologisk tilstand. Vi går gjennom utviklingen, justerer behandling og legger plan for videre oppfølging.',
        },
        {
          slug: 'nevrologisk-oppfolgning-video',
          title: 'Nevrologisk oppfølgning (video)',
          tagline: 'Videooppfølging for kjent utredet tilstand',
          price: '1 000,-',
          duration: '30 min',
          doctors: ['ardavan'],
          image: 'parkinson.jpg',
          lead: 'Videokonsultasjon for oppfølging av kjent nevrologisk tilstand der det ikke er behov for ny fysisk undersøkelse. Praktisk når du er borte fra Oslo eller har vanskelig for å komme deg ut.',
        },
        {
          slug: 'hodepine-migrene-utredning-oslo',
          title: 'Hodepineutredning (førstegang)',
          tagline: 'Førstegangsutredning av hodepine og migrene',
          price: '3 000,-',
          duration: '60 min',
          doctors: ['ardavan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/94301f21-04fa-4016-87ac-9ed3e60d8817/d4fa602cc403ec6f4550931930edb73cd228046300993358805d6b4dfe487804.jpg',
          lead: 'Førstegangs hodepineutredning hos nevrolog. Vi kartlegger hodepinemønster, utelukker alvorlig årsak og setter opp en konkret plan — fra livsstilstiltak til medisinsk forebygging.',
        },
        {
          slug: 'hodepine-konsultasjon',
          title: 'Hodepinekonsultasjon (oppfølging)',
          tagline: 'Strukturert oppfølging av hodepine eller migrene',
          price: '1 500,-',
          duration: '45 min',
          doctors: ['ardavan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/94301f21-04fa-4016-87ac-9ed3e60d8817/d4fa602cc403ec6f4550931930edb73cd228046300993358805d6b4dfe487804.jpg',
          lead: 'Fokusert oppfølgingskonsultasjon for hodepine eller migrene — for deg som allerede er utredet eller ikke trenger full utredningspakke. Ta med HIT-6-skjema og hodepinedagbok hvis du har det.',
        },
        {
          slug: 'parkinson-vurdering',
          title: 'Parkinson-vurdering',
          tagline: 'Spesialistvurdering av Parkinsons sykdom',
          price: '2 510,-',
          duration: '60 min',
          doctors: ['ardavan'],
          image: 'parkinson.jpg',
          lead: 'Spesialistvurdering for mistenkt eller bekreftet Parkinsons sykdom — grundig klinisk undersøkelse, vurdering av symptomer og plan for medisinsk behandling eller videre utredning.',
        },
        {
          slug: 'tremor-vurdering',
          title: 'Tremor-vurdering',
          tagline: 'Utredning av skjelvinger og ufrivillige bevegelser',
          price: '2 510,-',
          duration: '60 min',
          doctors: ['ardavan'],
          image: 'parkinson.jpg',
          lead: 'Utredning av tremor (skjelvinger) og andre ufrivillige bevegelser. Vurdering hos nevrolog for å avklare årsak — essensiell tremor, Parkinson, eller andre tilstander — og plan for behandling.',
        },
        {
          slug: 'second-opinion-nevrolog',
          title: 'Second opinion',
          tagline: 'Uavhengig spesialistvurdering',
          price: '2 000,-',
          duration: '45 min',
          doctors: ['ardavan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/76952d84-20ee-4b14-8b92-596abf442963/kons+3.jpg',
          lead: 'Uavhengig second opinion på allerede stilt diagnose eller foreslått behandling. Ta med epikrise, MR-/CT-svar og blodprøver. Skriftlig oppsummering inkludert.',
        },
      ],
    },

    // ===== ESTETIKK (1 card: comprehensive umbrella with 5 variants) =====
    {
      slug: 'estetikk',
      title: 'Estetikk',
      h2: 'Estetisk medisin i Oslo — hos spesialist',
      tagline: 'Rynkebehandling, filler, mesoterapi, trådløft og hyperhidrose',
      category: 'estetikk',
      fromPrice: '1 500,-',
      duration: 'Varierer',
      image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/d93a15b8-7b40-43b5-b6a1-d88af9944b56/Estetikk+jpg..jpg',
      intro: 'Estetiske behandlinger utført av spesialist i estetisk medisin. Vi anbefaler en kort konsultasjon for å finne riktig behandling for ditt mål.',
      variants: [
        {
          slug: 'rynkebehandling-oslo',
          title: 'Rynkebehandling',
          tagline: 'Diskret og naturlig resultat med botox',
          price: '2 000,-',
          duration: '30 min',
          doctors: ['ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/d93a15b8-7b40-43b5-b6a1-d88af9944b56/Estetikk+jpg..jpg',
          lead: 'Rynkebehandling med botulinumtoksin (botox) for mimiske rynker i panne, mellom øynene og rundt øynene. Et naturlig, friskt uttrykk — uten å endre ansiktstrekkene dine. Konsultasjon og behandling i samme time.',
        },
        {
          slug: 'filler-behandling-oslo',
          title: 'Filler',
          tagline: 'Naturlig fylde og kontur hos spesialist',
          price: '1 800,-',
          duration: '45 min',
          doctors: ['ardavan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/a084d0b8-e147-4fe8-847e-9a4a95ef54de/392a774340e40b511526288e6ca26ca04885ae651461174ec702733ea1233097.jpg',
          lead: 'Hyaluronsyrebasert filler gir naturlig fylde til lepper, kinn, kjevelinje og andre områder. Etablerte produkter og fokus på et balansert, ikke-overdrevet resultat. Resultat varer typisk 6–12 måneder.',
        },
        {
          slug: 'mesoterapi-oslo',
          title: 'Mesoterapi',
          tagline: 'Hudfornyelse med næringsstoffer og vitaminer',
          price: '1 500,-',
          duration: '45 min',
          doctors: ['ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/d93a15b8-7b40-43b5-b6a1-d88af9944b56/Estetikk+jpg..jpg',
          lead: 'Mikroinjeksjoner som tilfører huden næringsstoffer, vitaminer og hyaluronsyre. Bedre hudkvalitet, økt fasthet og mer uthvilt utseende. Anbefales som kur på 3–4 behandlinger med 2–4 ukers mellomrom.',
        },
        {
          slug: 'tradloft-oslo',
          title: 'Trådløft',
          tagline: 'Ikke-kirurgisk ansiktsløft hos spesialist',
          price: '12 000,-',
          duration: '90 min',
          doctors: ['ardavan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/d93a15b8-7b40-43b5-b6a1-d88af9944b56/Estetikk+jpg..jpg',
          lead: 'Oppløselige tråder legges inn under huden for å stramme opp slappere hud i ansikt, kjevelinje og hals. Umiddelbar løfteeffekt + kollagenstimulering. Resultat varer typisk 1–2 år.',
        },
        {
          slug: 'hyperhidrose-behandling-oslo',
          title: 'Hyperhidrose',
          tagline: 'Behandling av kraftig svette i armhuler',
          price: '2 200,-',
          duration: '30 min',
          doctors: ['ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/d417211a-f048-438b-ab56-91701275241d/Untitled.jpg',
          lead: 'Effektiv behandling av plagsom svette i armhuler med botulinumtoksin (botox). Virkning fra ca. 1 uke, varer typisk 6–9 måneder. Trygt og godt dokumentert.',
        },
      ],
    },

    // ===== DIGITAL (2 cards: Digital konsultasjon umbrella, Vaksiner single) =====
    {
      slug: 'digital-konsultasjon',
      title: 'Digital konsultasjon',
      h2: 'Digital legekonsultasjon i Oslo',
      tagline: 'Videokonsultasjon, rask konsultasjon og reseptfornyelse',
      category: 'digital',
      fromPrice: '300,-',
      duration: '10–15 min',
      image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/2746a2ff-381f-4372-9bb3-f411f3c8f774/hjemme+.jpg',
      intro: 'Sikker videokonsultasjon eller kort digital konsultasjon med lege — for nye plager, oppfølging av kjent problemstilling, eller reseptfornyelse. Like trygt som et fysisk besøk for de fleste alminnelige problemstillinger.',
      variants: [
        {
          slug: 'lege-pa-video',
          title: 'Legetime på video',
          tagline: 'Konsultasjon med lege der du er',
          price: '300,-',
          duration: '15 min',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/2746a2ff-381f-4372-9bb3-f411f3c8f774/hjemme+.jpg',
          lead: 'Få vurdering, råd eller behandling fra lege via sikker videokonsultasjon. Praktisk hjemmefra, på reise eller på jobb. Egnet for det meste som ikke krever fysisk undersøkelse.',
        },
        {
          slug: 'rask-resept-digital',
          title: 'Rask konsultasjon',
          tagline: 'For deg som vet hva du trenger',
          price: '300,-',
          duration: '10 min',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'https://images.squarespace-cdn.com/content/v1/6934b929cc2a590e91870ba8/35da8243-1f19-44c6-b699-b96911f42539/hjemme+.jpg',
          lead: 'Kort, fokusert konsultasjon ved kjent problemstilling — rask vurdering, kort attest, eller spørsmål til lege. Ofte digital, kan også gjøres fysisk.',
        },
        {
          slug: 'reseptfornyelse-video',
          title: 'Reseptfornyelse (video)',
          tagline: 'Trygg fornyelse av faste medisiner',
          price: '300,-',
          duration: '10 min',
          doctors: ['giti', 'ardavan', 'kaviyan'],
          image: 'resept.jpg',
          lead: 'Kort videokonsultasjon for fornyelse av resepter på medisiner du allerede bruker fast. Gjelder ikke A- og B-preparater eller helt nye medisiner.',
        },
      ],
    },
    {
      slug: 'vaksiner',
      title: 'Vaksiner',
      h2: 'Vaksiner i Oslo — digital konsultasjon og resept',
      tagline: 'HPV, reise, sesong, forebygging og allergi-injeksjoner',
      category: 'digital',
      price: '300,-',
      duration: '10 min digital',
      doctors: ['giti', 'ardavan', 'kaviyan'],
      image: 'vaksine.jpg',
      lead: 'Digital legekonsultasjon for resept på vaksiner — HPV, reise (TBE, Hep A/B, kombinasjonsvaksine), sesong (influensa), forebygging (herpes zoster, pneumokokker) — samt oppfølging av pågående allergi-injeksjoner. Vaksinen settes hos samarbeidsapotek mot et lite administrasjonsgebyr.',
      sections: {
        forHvem: 'Voksne som trenger vaksinasjon, eller som fortsetter en allerede oppstartet allergibehandling.',
        slikForegar: 'Kort digital konsultasjon med vurdering av indikasjon og kontraindikasjoner. Resepten sendes til ditt foretrukne apotek. Gjennomsnittlig svartid ca. 15 minutter.',
      },
    },
  ];

  // ---------- HELPERS --------------------------------------------------------
  const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  function doctorLine(svc) {
    const ds = (svc.doctors || []).map(id => DOCTORS[id]).filter(Boolean);
    if (ds.length === 0) return '';
    if (ds.length === 1) return `Behandles av ${ds[0].name}, ${ds[0].role.toLowerCase()}`;
    if (ds.length === 2) return `Behandles av ${ds[0].name} eller ${ds[1].name}`;
    return 'Behandles av en av våre leger — Giti, Ardavan eller Kaviyan';
  }

  // PatientSky booking — Neurobelle Klinikk
  // serviceProviderId from PatientSky admin > Innstillinger > Ekstern bookingside.
  // Patient clicks variant CTA → opens PatientSky's hosted booking widget in a new tab.
  const PS_PROVIDER_ID = '98b4722e-3418-11f1-a9b0-12f246543b9f';
  const PS_BASE = 'https://psno-patient-platform-fe.svc.pasientsky.no/embedded/planner/booking';

  function bookingUrl(svc) {
    const params = new URLSearchParams({ serviceProviderId: PS_PROVIDER_ID });
    // If a variant has a PatientSky timeslotTypeId, pre-select that service inside PatientSky
    if (svc.psTimeslotTypeId) params.set('timeslotType', svc.psTimeslotTypeId);
    return PS_BASE + '?' + params.toString();
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Flatten umbrellas → all variants + single services, for schema/search
  function flatServices() {
    const out = [];
    SERVICES.forEach(s => {
      if (s.variants && s.variants.length) {
        s.variants.forEach(v => out.push({ ...v, category: s.category, parentSlug: s.slug }));
      } else {
        out.push(s);
      }
    });
    return out;
  }

  // ---------- SCHEMA.ORG injection (SEO) -------------------------------------
  function injectSchema() {
    if (document.getElementById('nb-behandlinger-schema')) return;
    const items = flatServices().map(s => ({
      '@type': 'MedicalProcedure',
      name: s.title,
      url: 'https://www.neurobelleklinikk.com/behandlinger#' + s.slug,
      description: s.lead || '',
      bodyLocation: s.category === 'nevrologi' ? 'Nervesystem' : (s.category === 'estetikk' ? 'Hud' : undefined),
    }));
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalClinic',
          name: 'Neurobelle Klinikk',
          url: 'https://www.neurobelleklinikk.com',
          telephone: '+47 458 17 755',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Arbeidersamfunnets plass 1',
            addressLocality: 'Oslo',
            postalCode: '0181',
            addressCountry: 'NO',
          },
          medicalSpecialty: ['Neurology', 'PrimaryCare', 'Dermatology'],
          availableService: items,
        },
      ],
    };
    const s = document.createElement('script');
    s.id = 'nb-behandlinger-schema';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  // ---------- MOUNT ----------------------------------------------------------
  function findHost() {
    return document.getElementById('nb-behandlinger');
  }

  // Squarespace head injection hoists <div> into <body>. Move into <main>.
  function relocate(host) {
    const main = document.querySelector('main#page article#sections')
              || document.querySelector('main#page')
              || document.querySelector('main');
    if (main && host.parentNode !== main) main.appendChild(host);
  }

  function mountIfNeeded() {
    const host = findHost();
    if (!host || host.dataset.nbMounted) return;
    host.dataset.nbMounted = '1';
    document.body.classList.add('nb-behandlinger-page');
    relocate(host);
    render(host);
    injectSchema();
  }

  // ---------- RENDER ---------------------------------------------------------
  function render(host) {
    const state = { activeCat: 'all', openSlug: null };

    host.innerHTML = `
      <header class="nbb-hero">
        <h1 class="nbb-hero__title">Behandlinger</h1>
        <p class="nbb-hero__sub">Privat lege og spesialist i Oslo sentrum — allmennlege, nevrologi, estetisk medisin og digitale konsultasjoner. Velg en kategori for å se behandlinger og bestille time.</p>
      </header>

      <nav class="nbb-tabs" id="nbb-tabs" aria-label="Kategorier"></nav>

      <section class="nbb-grid" id="nbb-grid" aria-live="polite"></section>
    `;

    const $tabs = host.querySelector('#nbb-tabs');
    const $grid = host.querySelector('#nbb-grid');

    function paintTabs() {
      $tabs.innerHTML = CATEGORIES.map(c =>
        `<button type="button" class="nbb-tab ${c.id === state.activeCat ? 'is-active' : ''}" data-cat="${c.id}">${c.label}</button>`
      ).join('');
      $tabs.querySelectorAll('.nbb-tab').forEach(el => {
        el.addEventListener('click', () => {
          state.activeCat = el.dataset.cat;
          state.openSlug = null;
          paintTabs();
          paintGrid();
        });
      });
    }

    function filteredServices() {
      if (state.activeCat === 'all') return SERVICES;
      return SERVICES.filter(s => s.category === state.activeCat);
    }

    function paintGrid() {
      const list = filteredServices();
      const open = state.openSlug ? SERVICES.find(s => s.slug === state.openSlug) : null;

      $grid.innerHTML = list.map(s => `
        <button type="button" class="nbb-card" data-slug="${s.slug}" id="card-${s.slug}">
          <div class="nbb-card__img-wrap">
            <img class="nbb-card__img" src="${img(s.image)}" alt="${escape(s.title)}" loading="lazy">
          </div>
          <div class="nbb-card__body">
            <h3 class="nbb-card__title">${escape(s.title)}</h3>
            <p class="nbb-card__tagline">${escape(s.tagline)}</p>
            <div class="nbb-card__footer">
              <span class="nbb-card__duration">${escape(s.duration)}</span>
              <span class="nbb-card__price">${s.variants ? 'Fra ' + escape(s.fromPrice) : escape(s.price)}</span>
            </div>
          </div>
        </button>
      `).join('') + (open ? renderDetail(open) : '');

      $grid.querySelectorAll('.nbb-card').forEach(el => {
        el.addEventListener('click', () => {
          state.openSlug = state.openSlug === el.dataset.slug ? null : el.dataset.slug;
          paintGrid();
          if (state.openSlug) {
            setTimeout(() => {
              const det = host.querySelector('.nbb-detail');
              if (det) det.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 60);
          }
        });
      });

      const $close = host.querySelector('#nbb-detail-close');
      if ($close) $close.addEventListener('click', (e) => {
        e.stopPropagation();
        state.openSlug = null;
        paintGrid();
      });
    }

    function renderDetail(s) {
      if (s.variants && s.variants.length) return renderUmbrella(s);
      return renderSingle(s);
    }

    function renderSingle(s) {
      return `
        <article class="nbb-detail" id="${s.slug}">
          <div class="nbb-detail__header">
            <img class="nbb-detail__img" src="${img(s.image)}" alt="${escape(s.title)}">
            <div class="nbb-detail__head">
              <h2>${escape(s.h2)}</h2>
              <p class="nbb-detail__tagline">${escape(s.tagline)}</p>
              <dl class="nbb-detail__meta">
                <div><dt>Varighet</dt><dd>${escape(s.duration)}</dd></div>
                <div><dt>Pris</dt><dd class="is-price">${escape(s.price)}</dd></div>
                <div style="grid-column: 1 / -1"><dt>Lege</dt><dd>${escape(doctorLine(s))}</dd></div>
              </dl>
            </div>
          </div>

          <div class="nbb-detail__body">
            <p>${escape(s.lead)}</p>

            <h3>For hvem</h3>
            <p>${escape(s.sections.forHvem)}</p>

            <h3>Slik foregår det</h3>
            <p>${escape(s.sections.slikForegar)}</p>
          </div>

          <div class="nbb-detail__actions">
            <a class="nbb-cta" href="${bookingUrl(s)}" target="_blank" rel="noopener">
              Bestill time
              <span class="nbb-cta__arrow">${ARROW}</span>
            </a>
            ${landingPage(s) ? `<a class="nbb-link" href="${landingPage(s)}">Les mer ${ARROW}</a>` : ''}
            <button type="button" class="nbb-close" id="nbb-detail-close">Lukk</button>
          </div>
        </article>
      `;
    }

    function renderUmbrella(s) {
      return `
        <article class="nbb-detail nbb-detail--umbrella" id="${s.slug}">
          <div class="nbb-detail__header">
            <img class="nbb-detail__img" src="${img(s.image)}" alt="${escape(s.title)}">
            <div class="nbb-detail__head">
              <h2>${escape(s.h2)}</h2>
              <p class="nbb-detail__tagline">${escape(s.tagline)}</p>
              <p class="nbb-detail__intro">${escape(s.intro)}</p>
            </div>
          </div>

          <h3 class="nbb-variants-h">Velg behandling</h3>
          <div class="nbb-variants">
            ${s.variants.map(v => `
              <div class="nbb-variant" id="${v.slug}">
                <h4 class="nbb-variant__title">${escape(v.title)}</h4>
                <p class="nbb-variant__tagline">${escape(v.tagline)}</p>
                <p class="nbb-variant__lead">${escape(v.lead)}</p>
                <div class="nbb-variant__meta">
                  <span>${escape(v.duration)}</span>
                  <span class="nbb-variant__price">${escape(v.price)}</span>
                </div>
                <div class="nbb-variant__doc">${escape(doctorLine(v))}</div>
                <div class="nbb-variant__actions">
                  <a class="nbb-cta nbb-cta--sm" href="${bookingUrl(v)}" target="_blank" rel="noopener">
                    Bestill ${escape(v.title.toLowerCase())}
                    <span class="nbb-cta__arrow">${ARROW}</span>
                  </a>
                  ${landingPage(v) ? `<a class="nbb-link nbb-link--sm" href="${landingPage(v)}">Les mer ${ARROW}</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="nbb-detail__actions">
            <button type="button" class="nbb-close" id="nbb-detail-close">Lukk</button>
          </div>
        </article>
      `;
    }

    paintTabs();
    paintGrid();
  }

  // ---------- LIFECYCLE (Squarespace SPA) ------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIfNeeded);
  } else {
    mountIfNeeded();
  }
  document.addEventListener('mercury:load', mountIfNeeded);
  window.addEventListener('popstate', () => setTimeout(mountIfNeeded, 50));
})();
