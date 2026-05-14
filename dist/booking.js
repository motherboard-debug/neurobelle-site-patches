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

  // Texts that should always route to the booking page, exact-match
  // (case + diacritics insensitive, trimmed). Keep short and conservative
  // so we never hijack prose links that happen to contain these words.
  const BOOKING_KEYWORDS = [
    'bestill time',
    'bestill',
    'ledige timer',
    'se ledige timer',
    'booking',
    'book time',
    'book',
  ];

  function normalize(s) {
    return (s || '')
      .replace(/ /g, ' ')
      .trim()
      .toLowerCase();
  }

  function isBookingText(txt) {
    return BOOKING_KEYWORDS.indexOf(normalize(txt)) !== -1;
  }

  function routeBookingLinks() {
    // <a> tags — rewrite href in place
    document.querySelectorAll('a').forEach(function (a) {
      if (a.dataset.nbRouted) return;
      if (!isBookingText(a.textContent)) return;
      a.setAttribute('href', BOOKING_PATH);
      a.removeAttribute('target');
      a.dataset.nbRouted = '1';
    });

    // <button>, role="button", or anything with matching text that isn't an <a>
    document.querySelectorAll('button, [role="button"]').forEach(function (b) {
      if (b.dataset.nbRouted) return;
      if (b.tagName === 'A') return;
      if (!isBookingText(b.textContent)) return;
      b.dataset.nbRouted = '1';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = BOOKING_PATH;
      }, true);
    });
  }

  // ---------- BODY CLASS SYNC ------------------------------------------------
  function syncBodyClass() {
    const onBookingPage = !!document.getElementById('nb-booking');
    document.body.classList.toggle('nb-booking-page', onBookingPage);
  }

  // ---------- MOUNT ----------------------------------------------------------
  function mountIfNeeded() {
    syncBodyClass();
    routeBookingLinks();
    const host = document.getElementById('nb-booking');
    if (!host || host.dataset.nbMounted) return;
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
    });
    const start = function () {
      if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  }
})();
