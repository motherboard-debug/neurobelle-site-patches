/* ============================================================
   Neurobelle — site-wide polish JS
   Tiny script that adds cross-page UX improvements:
   - "Tilbake til behandlinger" link at bottom of every service page

   Loaded via Squarespace Code Injection HEADER. Idempotent —
   safe to run on every navigation including Squarespace's SPA.
   ============================================================ */
(function () {
  function injectBackLink() {
    // Don't inject on the catalog page (it IS the catalog) — Kaviyan renamed
    // /behandlinger to /bestill-time URL on 2026-05-20, so the catalog lives there now.
    const path = location.pathname.replace(/\/$/, '');
    if (path === '/bestill-time' || path === '/behandlinger' || path === '') return;

    // Don't re-inject if already there
    if (document.querySelector('.nb-back-to-catalog')) return;

    // Find a sensible anchor near the end of <main>
    const main = document.querySelector('main#page article#sections')
              || document.querySelector('main#page')
              || document.querySelector('main');
    if (!main) return;

    // Only add to pages with substantial content (skip homepage which already navigates)
    const isHomepage = ['/', '/home', '/home-1', '/home-1-1'].includes(path);
    if (isHomepage) return;

    const a = document.createElement('a');
    // Catalog lives at /behandlinger since the 2026-06-04 slug swap
    // (/bestill-time is the booking menu, not the catalog).
    a.href = '/behandlinger';
    a.className = 'nb-back-to-catalog';
    a.textContent = '← Se alle behandlinger';
    main.appendChild(a);
  }

  // Legacy /timer links → /bestill-time, including query strings
  // (/timer?go=vaksiner). Safety net while real hrefs are fixed in the
  // editor; harmless once they are. The old Code Injection shim missed
  // query-string variants — this supersedes it.
  function rewriteLegacyTimerLinks() {
    document
      .querySelectorAll('a[href="/timer"], a[href^="/timer?"], a[href^="/timer/"]')
      .forEach(function (a) {
        a.setAttribute('href', a.getAttribute('href').replace(/^\/timer/, '/bestill-time'));
      });
  }

  function run() {
    injectBackLink();
    rewriteLegacyTimerLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('mercury:load', run);
  window.addEventListener('popstate', () => setTimeout(run, 50));
})();
