(function () {
  // ---------- CONFIG ---------------------------------------------------------
  // TODO: replace with your real PatientSky serviceProviderId (UUID).
  // Until then, the booking iframe shows a fallback "coming soon" panel
  // with a contact link so no broken UX hits real patients.
  const PS_PROVIDER_ID = (window.NB_PS_PROVIDER_ID || 'YOUR-PROVIDER-ID-HERE').trim();

  const PS_BASE = 'https://psno-patient-platform-fe.svc.pasientsky.no/embedded/planner/booking';

  const CLINIC = {
    name: 'Neurobelle, Oslo sentrum',
    address: 'Arbeidersamfunnets plass 1, 0181 Oslo',
    phone: null,                 // e.g. '+47 22 00 00 00'
    contactEmail: 'post@neurobelleklinikk.com',  // change if different
  };

  // Each service can optionally carry a timeslotTypeId once you have one.
  // While timeslotTypeId is null, clicking the service just opens the generic
  // PatientSky booking page for this clinic — the patient picks the service
  // inside PatientSky's UI.
  const SERVICES = [
    { id: 'allmenn',   name: 'Allmennlege konsultasjon',           sub: 'Trygg og grundig vurdering av lege.',         price: '795,-',   duration: '20 min', timeslotTypeId: null },
    { id: 'hodepine',  name: 'Hodepineutredning',                  sub: 'Migrene- og hodepinevurdering med plan.',      price: '1 490,-', duration: '40 min', timeslotTypeId: null },
    { id: 'digital',   name: 'Digital lege (video)',               sub: 'Konsultasjon på video — der du er.',           price: '595,-',   duration: '15 min', timeslotTypeId: null },
    { id: 'resept',    name: 'Rask resept',                        sub: 'Fornyelse av faste medisiner, vurdert digitalt.', price: '349,-', duration: '5 min',  timeslotTypeId: null },
    { id: 'nevro-fys', name: 'Nevrologisk utredning (klinikk)',    sub: 'Fysisk undersøkelse hos nevrolog.',            price: '2 490,-', duration: '60 min', timeslotTypeId: null },
    { id: 'nevro-dig', name: 'Nevrologisk utredning (digital)',    sub: 'Videoutredning med nevrolog.',                  price: '1 990,-', duration: '45 min', timeslotTypeId: null },
  ];

  // ---------- HELPERS --------------------------------------------------------
  function svg(path) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }
  const ICONS = {
    pin:   svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  };

  function isProviderConfigured() {
    // Loose UUID check + reject the placeholder
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(PS_PROVIDER_ID);
  }

  function buildPsUrl(service) {
    const params = new URLSearchParams({ serviceProviderId: PS_PROVIDER_ID });
    if (service && service.timeslotTypeId) params.set('timeslotType', service.timeslotTypeId);
    return PS_BASE + '?' + params.toString();
  }

  // ---------- ROUTING --------------------------------------------------------
  // Path of the dedicated booking page. Change here if the slug ever moves.
  const BOOKING_PATH = '/bestill-time';

  // Texts that should route to the booking page. Two strategies:
  //
  //   1. EXACT match (after normalization) — short, unambiguous CTAs.
  //   2. SUBSTRING match — only for short link/button text (≤ 40 chars).
  //      Catches "Bestill time her", "Book din time", etc. without
  //      hijacking prose that mentions "booking" in passing.
  const BOOKING_EXACT = [
    'bestill time', 'bestill', 'ledige timer', 'se ledige timer',
    'booking', 'book time', 'book', 'bestill her', 'bestill time her',
    'book din time', 'book your appointment',
  ];
  const BOOKING_CONTAINS = [
    'bestill time', 'bestill her', 'bestill din time',
    'ledige timer', 'book time', 'book din time',
  ];
  const MAX_SUBSTRING_LEN = 40;

  function normalize(s) {
    return (s || '')
      .replace(/\s+/g, ' ')
      .replace(/[.!?]+$/g, '')
      .trim()
      .toLowerCase();
  }

  function isBookingText(txt) {
    const n = normalize(txt);
    if (!n) return false;
    if (BOOKING_EXACT.indexOf(n) !== -1) return true;
    if (n.length <= MAX_SUBSTRING_LEN) {
      for (let i = 0; i < BOOKING_CONTAINS.length; i++) {
        if (n.indexOf(BOOKING_CONTAINS[i]) !== -1) return true;
      }
    }
    return false;
  }

  function routeBookingLinks() {
    // <a> tags — rewrite href in place
    document.querySelectorAll('a').forEach(function (a) {
      if (a.dataset.nbRouted) return;
      if (isProtectedRegion(a)) return;            // skip catalog + booking widget + nav (was previously only in redirectAllButtons)
      if (!isBookingText(a.textContent)) return;
      a.setAttribute('href', BOOKING_PATH);
      a.removeAttribute('target');
      a.dataset.nbRouted = '1';
    });

    // <button>, role="button", or anything with matching text that isn't an <a>
    document.querySelectorAll('button, [role="button"]').forEach(function (b) {
      if (b.dataset.nbRouted) return;
      if (b.tagName === 'A') return;
      if (isProtectedRegion(b)) return;            // same protection as <a> branch above
      if (!isBookingText(b.textContent)) return;
      b.dataset.nbRouted = '1';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = BOOKING_PATH;
      }, true);
    });
  }

  // ---------- AGGRESSIVE BUTTON REDIRECT -------------------------------------
  // Every button-styled element on the site routes to /behandlinger, except:
  //   - "Om oss" / "Lær mer" / "Les mer" / "Tilbake" (informational CTAs)
  //   - Elements inside our own booking widget (#nb-booking)
  //   - Elements inside the /behandlinger catalog (#nb-behandlinger) — its
  //     own variant CTAs go straight to PatientSky, must not be hijacked
  //   - Main nav menu items (so site navigation still works)
  const BUTTON_SELECTOR = [
    '.sqs-block-button-element',
    '.sqs-button-element--primary',
    '.sqs-button-element--secondary',
    '.sqs-button-element--tertiary',
    'a.btn',
    'button.btn',
    'a.sqs-custom-cart',
    '[data-test="continue-to-cart"]',
    // Commerce — add-to-cart button on product pages
    '.sqs-add-to-cart-button',
    // Commerce — product cards on the /services-store listing
    'a.product-list-item-link',
    // Commerce — buy-now / checkout buttons if they appear
    '.sqs-buy-now-button',
    '.sqs-checkout-button',
  ].join(',');

  const BUTTON_SKIP_TEXTS = [
    'om oss', 'lær mer', 'laer mer', 'les mer',
    'mer info', 'tilbake', 'hopp til innhold',
  ];

  function isProtectedRegion(el) {
    if (!el) return false;
    if (el.closest('#nb-booking')) return true;
    if (el.closest('#nb-behandlinger')) return true;
    if (el.closest('.header-nav-list .header-nav-item')) return true;
    if (el.closest('.header-menu-nav-list')) return true;
    return false;
  }

  function shouldSkipButton(el) {
    if (isProtectedRegion(el)) return true;
    // Never hijack external links (PatientSky, payment portal, any third party)
    // or mailto/tel. The login/payment CTAs on /logg-inn must reach their real
    // target — the aggressive redirect only applies to on-site booking buttons.
    if (el.tagName === 'A') {
      var href = el.getAttribute('href') || '';
      if (/^(mailto:|tel:)/i.test(href)) return true;
      if (/^https?:\/\//i.test(href) && !/([^\/.]+\.)?neurobelleklinikk\.com/i.test(href)) return true;
    }
    // Never hijack explicit non-booking CTAs (data-cta="pasientsky"/"betaling"/…).
    var cta = el.getAttribute && el.getAttribute('data-cta');
    if (cta && ['bestill-time', 'book', 'booking'].indexOf(cta) === -1) return true;
    const txt = normalize(el.textContent);
    if (!txt) return false;                    // empty text (e.g. cart icon) → still route
    return BUTTON_SKIP_TEXTS.indexOf(txt) !== -1;
  }

  function hijackEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    window.location.href = BOOKING_PATH;
  }

  function redirectAllButtons() {
    document.querySelectorAll(BUTTON_SELECTOR).forEach(function (el) {
      if (el.dataset.nbRedirected) return;
      if (shouldSkipButton(el)) return;

      if (el.tagName === 'A') {
        // Anchor: rewrite href AND also capture clicks (Squarespace Commerce
        // sometimes intercepts clicks on product cards via JS instead of
        // letting the browser follow the href).
        el.setAttribute('href', BOOKING_PATH);
        el.removeAttribute('target');
      }

      // For every matched element: install pointerdown + click handlers in
      // capture phase so we run BEFORE Squarespace's own add-to-cart logic.
      // pointerdown fires earlier than click and beats most SPA frameworks.
      el.addEventListener('pointerdown', hijackEvent, true);
      el.addEventListener('click', hijackEvent, true);

      el.dataset.nbRedirected = '1';
    });
  }

  // ---------- BODY CLASS SYNC ------------------------------------------------
  function syncBodyClass() {
    const onBookingPage = !!document.getElementById('nb-booking');
    document.body.classList.toggle('nb-booking-page', onBookingPage);
  }

  // If the user pasted <div id="nb-booking"></div> into a Squarespace HEADER
  // injection (instead of a Code Block on the page), the browser hoists the
  // stray div out of <head> to the very start of <body>, which leaves the
  // real page <main> element empty and reserving viewport height. Move the
  // div into <main> so the page flows naturally and the footer sits flush.
  function relocateBookingDiv(host) {
    const target =
      document.querySelector('main#page article#sections') ||
      document.querySelector('main#page') ||
      document.querySelector('main');
    if (target && !target.contains(host)) {
      target.appendChild(host);
    }
  }

  // ---------- MOUNT ----------------------------------------------------------
  function mountIfNeeded() {
    syncBodyClass();
    routeBookingLinks();
    redirectAllButtons();
    const host = document.getElementById('nb-booking');
    if (!host) return;
    relocateBookingDiv(host);
    if (host.dataset.nbMounted) return;
    host.dataset.nbMounted = '1';
    render(host);
  }

  function render(host) {
    const state = { service: null };
    const protoNote = isProviderConfigured()
      ? ''
      : '<div class="nb-proto-banner"><strong>Visuell prototype</strong> &nbsp;·&nbsp; PatientSky kobles på når klinikkens ID er klar</div>';

    host.innerHTML = `
      ${protoNote}

      <div class="nb-hero">
        <h1 class="nb-hero__title">Bestill time</h1>
        <p class="nb-hero__sub">Velg tjeneste, så fortsetter du i vårt sikre bookingsystem PatientSky med BankID.</p>
      </div>

      <div class="nb-clinic">
        <span class="nb-clinic__row">${ICONS.pin}<span>${CLINIC.name} · ${CLINIC.address}</span></span>
        ${CLINIC.phone ? `<span class="nb-clinic__row">${ICONS.phone}<span>${CLINIC.phone}</span></span>` : ''}
      </div>

      <p class="nb-section-h">Velg tjeneste</p>
      <div class="nb-services" id="nb-services"></div>

      <div class="nb-cta-wrap">
        <button class="nb-cta" id="nb-cta" type="button">
          Fortsett til PatientSky
          <span class="nb-cta__arrow">${ICONS.arrow}</span>
        </button>
      </div>

      <div class="nb-frame-wrap" id="nb-frame-wrap" aria-live="polite"></div>
    `;

    const $services = host.querySelector('#nb-services');
    const $cta      = host.querySelector('#nb-cta');
    const $frame    = host.querySelector('#nb-frame-wrap');

    function paintServices() {
      $services.innerHTML = SERVICES.map(s => `
        <button type="button" class="nb-service ${state.service && state.service.id === s.id ? 'is-active' : ''}" data-id="${s.id}">
          <div class="nb-service__name">${s.name}</div>
          <div class="nb-service__sub">${s.sub}</div>
          <div class="nb-service__footer">
            <span class="nb-service__duration">${s.duration}</span>
            <span class="nb-service__price">${s.price}</span>
          </div>
        </button>
      `).join('');
      $services.querySelectorAll('.nb-service').forEach(el => {
        el.addEventListener('click', () => {
          state.service = SERVICES.find(s => s.id === el.dataset.id);
          paintServices();
          $cta.classList.add('is-ready');
        });
      });
    }

    function openFrame() {
      const svc = state.service;
      if (!svc) return;

      // Scroll into the frame area for nice UX
      setTimeout(() => $frame.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

      if (!isProviderConfigured()) {
        $frame.innerHTML = `
          <div class="nb-frame-bar">
            <div class="nb-frame-bar__title">
              <strong>${svc.name}</strong>
              <span>${CLINIC.name}</span>
            </div>
            <button class="nb-frame-bar__close" id="nb-frame-close" aria-label="Lukk">×</button>
          </div>
          <div class="nb-frame-fallback">
            <h4>Online booking er på vei</h4>
            <p>PatientSky-integrasjonen er ikke ferdig konfigurert ennå.<br>Send oss en e-post så bekrefter vi time manuelt.</p>
            <a class="nb-cta is-ready" href="mailto:${CLINIC.contactEmail}?subject=${encodeURIComponent('Timebestilling: ' + svc.name)}&body=${encodeURIComponent('Hei!\\n\\nJeg ønsker å bestille time for: ' + svc.name + '\\n\\nMine ønsker:\\n- Dato/tid:\\n- Telefon:\\n\\nMvh')}">
              Kontakt oss på e-post
              <span class="nb-cta__arrow">${ICONS.arrow}</span>
            </a>
          </div>
        `;
      } else {
        const url = buildPsUrl(svc);
        $frame.innerHTML = `
          <div class="nb-frame-bar">
            <div class="nb-frame-bar__title">
              <strong>${svc.name}</strong>
              <span>Sikker booking via PatientSky · BankID</span>
            </div>
            <button class="nb-frame-bar__close" id="nb-frame-close" aria-label="Lukk">×</button>
          </div>
          <iframe class="nb-frame" src="${url}" title="PatientSky booking" allow="payment; clipboard-read; clipboard-write" referrerpolicy="origin"></iframe>
        `;
      }

      $frame.classList.add('is-visible');
      const $close = $frame.querySelector('#nb-frame-close');
      if ($close) $close.addEventListener('click', closeFrame);
    }

    function closeFrame() {
      $frame.classList.remove('is-visible');
      setTimeout(() => { $frame.innerHTML = ''; }, 300);
    }

    $cta.addEventListener('click', openFrame);

    paintServices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIfNeeded);
  } else {
    mountIfNeeded();
  }
  document.addEventListener('mercury:load', mountIfNeeded);
  window.addEventListener('popstate', () => setTimeout(mountIfNeeded, 50));

  // Squarespace sometimes injects nav/footer content asynchronously after
  // first paint. Watch the DOM for newly-added link/button text and re-route
  // — keeps things working through cookie banners, lazy nav, etc.
  if ('MutationObserver' in window) {
    const obs = new MutationObserver(function () {
      routeBookingLinks();
      redirectAllButtons();
    });
    const start = function () {
      if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  }
})();
