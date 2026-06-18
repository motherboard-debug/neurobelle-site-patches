/* ============================================================
   Neurobelle — SEO fundament layer v1 (2026-06-17)
   Companion to seo.css. Ships through the same jsDelivr → HEADER
   pipeline as the other dist/ modules. Everything here is read by
   Google from the *rendered* DOM (JSON-LD, alt text, lang, OG), so
   it is real on-page SEO — not cosmetic.

   What it does (all idempotent, anti-churn — only acts when the
   thing is actually missing or wrong):
     1. ensureLang()        — <html lang="no"> if unset
     2. ensureCanonical()   — self-referential canonical if missing
     3. injectBreadcrumb()  — BreadcrumbList JSON-LD from the path
     4. injectFaq()         — visible, AI-extractable FAQ block +
                              FAQPage JSON-LD on mapped service pages
     5. fixImageAlts()      — fills empty alt from caption / heading
     6. ensureOgFallback()  — og:title / og:description if missing

   COMPLIANCE: no prescription-drug brand names anywhere (see the
   forbidden-words list in README + validate-deploy.sh). Medical
   injection treatment is described generically as "medikamentell
   injeksjonsbehandling". No guarantees, no before/after promises.
   FAQ medical copy is pending Kaviyan's sign-off (see
   seo/to-approval.md) — nothing goes live until he re-pastes the
   HEADER block.

   Idempotent; safe across Squarespace SPA navigations.
   ============================================================ */
(function () {
  var SITE = 'https://www.neurobelleklinikk.com';
  // Approved social card (lives in this repo, served by jsDelivr). Only used
  // as a last-resort fallback when the page has no og:image of its own.
  var OG_IMAGE = 'https://cdn.jsdelivr.net/gh/motherboard-debug/neurobelle-site-patches@main/dist/img/og-image.jpg';

  // ---- helpers -------------------------------------------------------------
  function cleanPath() {
    return location.pathname.replace(/\/+$/, '') || '/';
  }

  // Upsert: the <head> survives Squarespace Ajax (mercury) navigations, so a
  // per-page JSON-LD block from the previous page would otherwise go stale on
  // the next. Update in place (or create) so it always reflects the current path.
  function addJsonLd(id, obj) {
    var s = document.getElementById(id);
    if (!s) {
      s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = id;
      document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(obj);
  }
  function removeJsonLd(id) {
    var s = document.getElementById(id);
    if (s) s.parentNode.removeChild(s);
  }

  function prettify(slug) {
    return slug
      .replace(/-oslo$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); })
      .trim();
  }

  // Friendly breadcrumb labels for known slugs (fall back to prettify)
  var LABELS = {
    'om-oss': 'Om oss',
    'about': 'Om oss',
    'bestill-time': 'Bestill time',
    'behandlinger': 'Behandlinger',
    'priser': 'Priser',
    'legekonsultasjon-oslo': 'Legekonsultasjon Oslo',
    'hodepine-migrene-oslo': 'Hodepine og migrene',
    'vektreduksjon-oslo': 'Vektreduksjon',
    'hyperhidrose-oslo': 'Hyperhidrose',
    'privat-nevrolog-oslo': 'Privat nevrolog Oslo',
    'hudpleie-oslo': 'Hudpleie Oslo',
    'filler-oslo': 'Filler Oslo',
    'rynkebehandling-oslo': 'Rynkebehandling Oslo',
    'generell-nevrologisk-utredning': 'Nevrologisk utredning',
    'estetisk-klinikk-oslo': 'Estetisk klinikk Oslo',
    'vaksiner': 'Vaksiner',
    'attester': 'Legeattester',
    'resept-fornyelse': 'Reseptfornyelse',
    'hpv': 'HPV-vaksine'
  };

  // ---- 1. lang -------------------------------------------------------------
  function ensureLang() {
    var html = document.documentElement;
    if (!html.getAttribute('lang')) html.setAttribute('lang', 'no');
  }

  // ---- 2. canonical --------------------------------------------------------
  function ensureCanonical() {
    if (document.querySelector('link[rel="canonical"]')) return;
    var link = document.createElement('link');
    link.rel = 'canonical';
    link.href = SITE + (cleanPath() === '/' ? '/' : cleanPath());
    document.head.appendChild(link);
  }

  // ---- 3. breadcrumb -------------------------------------------------------
  function injectBreadcrumb() {
    var path = cleanPath();
    if (path === '/') { removeJsonLd('nb-breadcrumb-ld'); return; } // none on home; clear stale
    var segs = path.split('/').filter(Boolean);
    var items = [{
      '@type': 'ListItem', position: 1, name: 'Hjem', item: SITE + '/'
    }];
    var acc = '';
    segs.forEach(function (seg, i) {
      acc += '/' + seg;
      items.push({
        '@type': 'ListItem',
        position: i + 2,
        name: LABELS[seg] || prettify(seg),
        item: SITE + acc
      });
    });
    addJsonLd('nb-breadcrumb-ld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    });
  }

  // ---- 4. FAQ (visible + FAQPage JSON-LD) ----------------------------------
  // DRAFT medical copy — edruelig, no guarantees, no brand drug names.
  // Pending Kaviyan sign-off before the HEADER block is re-pasted live.
  var FAQ = {
    '/legekonsultasjon-oslo': [
      ['Kan jeg bestille legetime i Oslo uten fastlege her?',
       'Ja. Du trenger ikke å ha oss som fastlege for å bestille en konsultasjon. Vi tar imot pasienter som ønsker en rask vurdering hos allmennlege i Oslo sentrum, og du booker time selv på nett.'],
      ['Hva koster en legekonsultasjon?',
       'Prisene står oppdatert på bestill-time-siden. Du ser pris og varighet for hver tjeneste før du bekrefter timen, uten skjulte gebyrer.'],
      ['Tilbyr dere digital legetime?',
       'Ja, flere konsultasjoner kan gjennomføres på video der det er medisinsk forsvarlig. Ved behov for fysisk undersøkelse kaller legen deg inn til klinikken.']
    ],
    '/hodepine-migrene-oslo': [
      ['Når bør jeg utredes av nevrolog for hodepine?',
       'Ved hyppig eller invalidiserende hodepine, migrene som ikke responderer på vanlig behandling, eller nye eller endrede symptomer, kan en vurdering hos nevrolog være aktuell. Legen tar stilling til videre utredning individuelt.'],
      ['Tilbyr dere injeksjonsbehandling mot kronisk migrene?',
       'Ved kronisk migrene kan medikamentell injeksjonsbehandling være aktuelt for enkelte pasienter når fastsatte kriterier er oppfylt. Det vurderes av lege på medisinsk indikasjon, og er reseptbelagt behandling.'],
      ['Kan jeg få time hos privat nevrolog i Oslo uten henvisning?',
       'Du kan bestille time til en privat nevrologisk vurdering hos oss uten henvisning. Trenger du henvisning videre i det offentlige, hjelper legen med det.']
    ],
    '/vektreduksjon-oslo': [
      ['Hvem passer medisinsk vektreduksjon for?',
       'Behandling vurderes individuelt ut fra helse, KMI og tidligere tiltak. Legen gjør en helhetlig vurdering og foreslår et forsvarlig opplegg — medikamentell behandling er ikke aktuelt for alle.'],
      ['Følger dere meg opp underveis?',
       'Ja. Vektreduksjon følges opp med kontroller hos lege slik at behandlingen kan justeres trygt over tid.']
    ],
    '/hyperhidrose-oslo': [
      ['Hva er hyperhidrose?',
       'Hyperhidrose er overdreven svetting som går ut over hverdagen, oftest i armhuler, hender eller føtter. Det er en medisinsk tilstand som kan utredes og behandles av lege.'],
      ['Hvilken behandling finnes mot overdreven svette?',
       'Aktuelle tiltak vurderes individuelt og kan omfatte reseptbelagt antiperspirant, og for utvalgte pasienter medikamentell injeksjonsbehandling. Legen vurderer hva som er forsvarlig i ditt tilfelle.'],
      ['Trenger jeg henvisning for å få time?',
       'Nei, du kan bestille time til en vurdering hos oss uten henvisning. Trenger du videre henvisning, hjelper legen med det.']
    ],
    '/privat-nevrolog-oslo': [
      ['Kan jeg få time hos privat nevrolog i Oslo uten henvisning?',
       'Ja. Du kan bestille time til en privat nevrologisk vurdering hos oss uten henvisning, med kort ventetid.'],
      ['Hva kan en nevrolog utrede?',
       'Blant annet hodepine og migrene, svimmelhet, nummenhet, skjelving og andre nevrologiske symptomer. Legen tar stilling til videre utredning individuelt.'],
      ['Hva skjer på den første konsultasjonen?',
       'Nevrologen går gjennom sykehistorien din, gjør en klinisk undersøkelse og legger en plan for eventuell videre utredning eller behandling.']
    ],
    '/generell-nevrologisk-utredning': [
      ['Trenger jeg henvisning for nevrologisk utredning?',
       'Nei, du kan bestille time til en privat nevrologisk utredning hos oss uten henvisning, med kort ventetid.'],
      ['Hva utreder en nevrolog?',
       'Blant annet hodepine og migrene, svimmelhet, nummenhet og prikking, skjelving, kraftsvikt og andre symptomer fra nervesystemet.'],
      ['Hva innebærer utredningen?',
       'En grundig samtale, klinisk nevrologisk undersøkelse og en plan for eventuelle videre tester. Målet er å forstå plagene og utelukke alvorlige årsaker.']
    ],
    '/estetisk-klinikk-oslo': [
      ['Må jeg ha konsultasjon før estetisk behandling?',
       'Ja, vi anbefaler alltid en kort konsultasjon hos lege først. Da vurderer vi ønsker, medisinske forhold og hva som er forsvarlig for deg.'],
      ['Hvem utfører behandlingene?',
       'Behandlingene utføres av lege med erfaring innen estetisk medisin, innenfor norsk regelverk.'],
      ['Kan dere garantere resultatet?',
       'Nei. Vi gir ingen garantier om bestemte resultater — målet er en faglig, ærlig vurdering og realistiske forventninger, med vekt på et naturlig uttrykk.']
    ],
    '/vaksiner': [
      ['Hvilke vaksiner kan jeg få resept på?',
       'Blant annet reisevaksiner, sesongvaksiner og forebyggende vaksiner. Legen vurderer hva som er aktuelt for deg i en kort konsultasjon.'],
      ['Hvordan foregår det?',
       'Du har en kort digital konsultasjon der legen vurderer indikasjon og eventuelle kontraindikasjoner, og sender resept til ditt foretrukne apotek.']
    ],
    '/attester': [
      ['Hvilke legeattester kan dere utstede?',
       'Vi utsteder flere vanlige attester, blant annet knyttet til førerkort, arbeid, reise og idrett. Avklar gjerne formålet på forhånd.'],
      ['Hva bør jeg ta med til en attesttime?',
       'Eventuelle skjemaer fra den som krever attesten, oversikt over faste medisiner og relevant sykehistorikk, samt legitimasjon.'],
      ['Kan legen garantere et bestemt utfall?',
       'Nei. En attest skal gjenspeile en faglig og uavhengig vurdering — det er nettopp det som gjør den gyldig.']
    ],
    '/resept-fornyelse': [
      ['Kan jeg fornye fast medisin digitalt?',
       'Ja, faste medisiner du allerede bruker kan ofte fornyes etter en kort digital vurdering hos lege.'],
      ['Hva kan ikke fornyes digitalt?',
       'Nye medisiner og enkelte reseptgrupper krever en vanlig konsultasjon. Legen vurderer hva som er forsvarlig i ditt tilfelle.']
    ]
  };

  function injectFaq() {
    var path = cleanPath();
    var qa = FAQ[path];
    if (!qa) {
      // navigated to a page with no FAQ — clear any stale block + schema
      removeJsonLd('nb-faq-ld');
      var stale = document.querySelector('.nb-faq');
      if (stale) stale.parentNode.removeChild(stale);
      return;
    }

    // Visible, AI-extractable block (rendered once)
    if (!document.querySelector('.nb-faq')) {
      var main = document.querySelector('main#page article#sections')
              || document.querySelector('main#page')
              || document.querySelector('main');
      if (main) {
        var sec = document.createElement('section');
        sec.className = 'nb-faq';
        var h = document.createElement('h2');
        h.className = 'nb-faq__title';
        h.textContent = 'Ofte stilte spørsmål';
        sec.appendChild(h);
        qa.forEach(function (pair) {
          var d = document.createElement('details');
          d.className = 'nb-faq__item';
          var sm = document.createElement('summary');
          sm.textContent = pair[0];
          var p = document.createElement('div');
          p.className = 'nb-faq__a';
          p.textContent = pair[1];
          d.appendChild(sm);
          d.appendChild(p);
          sec.appendChild(d);
        });
        main.appendChild(sec);
      }
    }

    // FAQPage JSON-LD
    addJsonLd('nb-faq-ld', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: qa.map(function (pair) {
        return {
          '@type': 'Question',
          name: pair[0],
          acceptedAnswer: { '@type': 'Answer', text: pair[1] }
        };
      })
    });
  }

  // ---- 5. image alt-text ---------------------------------------------------
  function fixImageAlts() {
    var imgs = document.querySelectorAll('img:not([data-nb-alt])');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      img.setAttribute('data-nb-alt', '1'); // mark as inspected
      var alt = img.getAttribute('alt');
      if (alt && alt.trim()) continue; // real alt already present — leave it

      // Skip icon/spacer-sized images: a descriptive alt on a decorative icon
      // hurts accessibility. Only skip when we positively know it's tiny.
      var r = img.getBoundingClientRect();
      if (r.width && r.height && r.width < 40 && r.height < 40) continue;

      // Derive from figure caption, nearest heading, or page context
      var derived = '';
      var fig = img.closest('figure');
      if (fig) {
        var cap = fig.querySelector('figcaption');
        if (cap && cap.textContent.trim()) derived = cap.textContent.trim();
      }
      if (!derived) {
        var sec = img.closest('section, article, div');
        var head = sec && sec.querySelector('h1, h2, h3');
        if (head && head.textContent.trim()) {
          derived = head.textContent.trim() + ' – Neurobelle Klinikk Oslo';
        }
      }
      if (!derived) derived = 'Neurobelle Klinikk Oslo';
      img.setAttribute('alt', derived.slice(0, 125));
    }
  }

  // ---- 6. Open Graph fallback ---------------------------------------------
  function ensureOgFallback() {
    function setMeta(prop, content) {
      if (!content) return;
      if (document.querySelector('meta[property="' + prop + '"]')) return;
      var m = document.createElement('meta');
      m.setAttribute('property', prop);
      m.setAttribute('content', content);
      document.head.appendChild(m);
    }
    function setMetaName(name, content) {
      if (!content) return;
      if (document.querySelector('meta[name="' + name + '"]')) return;
      var m = document.createElement('meta');
      m.setAttribute('name', name);
      m.setAttribute('content', content);
      document.head.appendChild(m);
    }
    var descEl = document.querySelector('meta[name="description"]');
    var desc = descEl ? descEl.getAttribute('content') : '';
    setMeta('og:title', document.title);
    setMeta('og:description', desc);
    setMeta('og:type', 'website');
    setMeta('og:url', SITE + (cleanPath() === '/' ? '/' : cleanPath()));
    setMeta('og:site_name', 'Neurobelle Klinikk');
    setMeta('og:locale', 'nb_NO');
    setMeta('og:image', OG_IMAGE);
    // Twitter Card (uses name= attributes, not property=)
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', document.title);
    setMetaName('twitter:description', desc);
    setMetaName('twitter:image', OG_IMAGE);
  }

  // ---- run -----------------------------------------------------------------
  function run() {
    ensureLang();
    ensureCanonical();
    injectBreadcrumb();
    injectFaq();
    fixImageAlts();
    ensureOgFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('mercury:load', run);
  window.addEventListener('popstate', function () { setTimeout(run, 50); });
})();
