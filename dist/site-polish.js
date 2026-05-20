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
    a.href = '/bestill-time';
    a.className = 'nb-back-to-catalog';
    a.textContent = '← Se alle behandlinger';
    main.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBackLink);
  } else {
    injectBackLink();
  }
  document.addEventListener('mercury:load', injectBackLink);
  window.addEventListener('popstate', () => setTimeout(injectBackLink, 50));
})();
