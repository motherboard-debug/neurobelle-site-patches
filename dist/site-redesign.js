/* ============================================================
   Neurobelle — site redesign layer v1 (2026-06-10)
   Companion to site-redesign.css:
   1. Tags the forside tagline-H1 so CSS can style it as a kicker
   2. Swaps emoji "icons" (stetoskop/hjerne/vekt/glitter) for
      lucide-style SVG line icons in brand blue; strips book emoji
   3. Makes the footer phone number a clickable tel: link

   Idempotent; safe across Squarespace SPA navigations.
   ============================================================ */
(function () {
  var ICONS = {
    '\u{1FA7A}': '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
    '\u{1F9E0}': '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>',
    '⚖️': '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    '✨': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/>'
  };
  var SVG_OPEN = '<svg class="nb-ico" viewBox="0 0 24 24" fill="none" stroke="#1e5670" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="26" height="26" style="vertical-align:-4px;margin-right:.45em" aria-hidden="true">';

  function tagTagline() {
    var h1s = document.querySelectorAll('h1');
    for (var i = 0; i < h1s.length; i++) {
      if (h1s[i].textContent.trim().indexOf('Moderne medisin') === 0) {
        h1s[i].classList.add('nb-tagline');
      }
    }
  }

  function swapEmojiIcons() {
    var els = document.querySelectorAll('h3, h4, strong');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.querySelector('svg.nb-ico')) continue;
      for (var emoji in ICONS) {
        if (el.innerHTML.indexOf(emoji) !== -1) {
          el.innerHTML = el.innerHTML.replace(emoji, SVG_OPEN + ICONS[emoji] + '</svg>').replace(/️/g, '');
        }
      }
    }
    // strip decorative emoji used as fake icons (book, bulb, card, link)
    var STRIP = /(\u{1F4D6}|\u{1F4A1}|\u{1F4B3}|\u{1F517})\s*/gu;
    var els2 = document.querySelectorAll('a, strong, b');
    for (var j = 0; j < els2.length; j++) {
      if (STRIP.test(els2[j].innerHTML)) {
        els2[j].innerHTML = els2[j].innerHTML.replace(STRIP, '');
      }
      STRIP.lastIndex = 0;
    }
  }

  // Content corrections that are pure text (real fix lives in the
  // Squarespace editor — these are safe client-side bridges):
  // - footer address typo "Arbeidersamfunnetsplass" (missing space),
  //   matters for NAP consistency with Google Business Profile
  // - English "Book time" button on /priser
  function fixTextSlips() {
    var foot = document.querySelector('footer');
    if (foot && foot.innerHTML.indexOf('Arbeidersamfunnetsplass') !== -1) {
      foot.innerHTML = foot.innerHTML.replace(/Arbeidersamfunnetsplass/g, 'Arbeidersamfunnets plass');
    }
    var as = document.querySelectorAll('a');
    for (var i = 0; i < as.length; i++) {
      if (/^\s*Book time/.test(as[i].textContent)) {
        as[i].textContent = as[i].textContent.replace('Book time', 'Bestill time');
      }
    }
  }

  // /om-oss has a duplicate "Møt legene" group (editor cleanup is
  // queued as Chrome-prompt C5) — hide every group after the first.
  function hideDuplicateTeam() {
    var wraps = document.querySelectorAll('.nbx-teamwrap');
    for (var i = 1; i < wraps.length; i++) wraps[i].style.display = 'none';
  }

  // Sticky mobile booking CTA (styled by site-redesign.css; shown
  // <768px only). Skipped on the booking pages themselves.
  function injectStickyCta() {
    if (document.querySelector('.nb-sticky-cta')) return;
    var path = location.pathname.replace(/\/$/, '');
    if (path === '/bestill-time' || path === '/behandlinger') return;
    var bar = document.createElement('div');
    bar.className = 'nb-sticky-cta';
    var a = document.createElement('a');
    a.href = '/bestill-time';
    a.textContent = 'Bestill time';
    bar.appendChild(a);
    document.body.appendChild(bar);
  }

  function linkifyFooterPhone() {
    var foot = document.querySelector('footer');
    if (!foot || foot.querySelector('a[href^="tel:"]')) return;
    var walker = document.createTreeWalker(foot, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var m = node.textContent.match(/\+47\s?[0-9 ]{8,11}/);
      if (m) {
        var num = m[0].replace(/\s/g, '');
        var a = document.createElement('a');
        a.href = 'tel:' + num;
        a.textContent = m[0];
        var rest = node.splitText(node.textContent.indexOf(m[0]));
        rest.textContent = rest.textContent.slice(m[0].length);
        node.parentNode.insertBefore(a, rest);
        break;
      }
    }
  }

  function run() {
    tagTagline();
    swapEmojiIcons();
    fixTextSlips();
    hideDuplicateTeam();
    linkifyFooterPhone();
    injectStickyCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('mercury:load', run);
  window.addEventListener('popstate', function () { setTimeout(run, 50); });
})();
