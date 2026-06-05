/* Neurobelle — Symptom-ruter «Hva plager deg?»
 * Selvstendig widget. Mountes i <div id="nb-symptomruter"></div>.
 * Ruter brukeren til riktig behandler + booking-dyplenke (/bestill-time?go=<slug>).
 * LAGRER INGENTING (ingen cookies, ingen nettverkskall, ingen helsedata ut av nettleseren).
 * Stil: samme terrakotta (#df7f4a) som HIT-6-widgeten. Ikke en diagnose.
 * Embed:  <div id="nb-symptomruter"></div>
 *         <script src="https://cdn.jsdelivr.net/gh/motherboard-debug/neurobelle-site-patches@<SHA>/dist/symptomruter.js"></script>
 */
(function () {
  function build() {
    var host = document.getElementById('nb-symptomruter');
    if (!host || host.dataset.m) return;
    host.dataset.m = '1';

    // ---- Beslutningstre (ingen persistering — ren in-memory navigasjon) ----
    // result: { h, who, body, go?, href?, cta, acute? }
    var R = {
      hodepineMig: { h: 'En hodepineutredning kan være riktig for deg', who: 'Nevrolog', body: 'Symptomene du beskriver kan passe med migrene. En grundig hodepineutredning hos nevrolog kartlegger mønster og årsak, og legger en plan tilpasset deg.', go: 'hodepine-forstegang', cta: 'Book hodepineutredning' },
      hodepineGen: { h: 'En hodepineutredning kan gi deg svar', who: 'Nevrolog', body: 'Tilbakevendende hodepine bør kartlegges. En hodepineutredning hos nevrolog finner ut hva plagene skyldes og hva som kan hjelpe.', go: 'hodepine-forstegang', cta: 'Book hodepineutredning' },
      svimmelAkutt: { h: 'Dette bør vurderes raskt', who: 'Lege', body: 'Plutselig svimmelhet sammen med talevansker, dobbeltsyn eller kraftløshet kan være tegn på noe som haster. Ring 113 eller legevakt nå hvis symptomene er der akkurat nå. Er det avtagende og du ønsker en rask vurdering, kan du booke en nevrologisk utredning.', go: 'nevrologisk-utredning', cta: 'Book nevrologisk utredning', acute: true },
      svimmelMild: { h: 'Start med en legevurdering', who: 'Allmennlege', body: 'Svimmelhet har mange ufarlige årsaker. En allmennlege kan gjøre den første kartleggingen og henvise videre til nevrolog internt ved behov.', go: 'lege-konsultasjon', cta: 'Book legekonsultasjon' },
      tremor: { h: 'En tremor-vurdering kan kartlegge skjelvingen', who: 'Nevrolog', body: 'Skjelving eller risting bør vurderes av nevrolog for å finne årsaken. Hos Neurobelle utfører Dr. Ardavan Karimi tremor-vurdering.', go: 'tremor', cta: 'Book tremor-vurdering' },
      nevroUtred: { h: 'En nevrologisk utredning er et godt neste steg', who: 'Nevrolog', body: 'Nummenhet, prikking, kraftløshet eller endringer i hukommelse og konsentrasjon bør utredes nevrologisk. En nevrologisk utredning kartlegger hva som ligger bak.', go: 'nevrologisk-utredning', cta: 'Book nevrologisk utredning' },
      vekt: { h: 'En oppstartssamtale om vekt og livsstil', who: 'Allmennlege', body: 'Ønsker du hjelp med vekt, starter vi med en samtale hos lege. Sammen ser vi på en helhetlig plan — med livsstil og eventuell medikamentell behandling der det er aktuelt, alltid individuelt vurdert.', go: 'vekt-oppstart', cta: 'Book oppstartssamtale' },
      legeVideo: { h: 'En videokonsultasjon passer godt', who: 'Allmennlege', body: 'For enkle vurderinger, mange typer resepter og rådgivning er video raskt og praktisk. Du slipper reisevei og får ofte hjelp samme eller neste dag.', go: 'legetime-video', cta: 'Book videokonsultasjon' },
      legeOppmote: { h: 'En vanlig legetime hos oss', who: 'Allmennlege', body: 'Trenger du undersøkelse, prøver eller en grundigere vurdering, passer en legetime med oppmøte sentralt ved Oslo S.', go: 'lege-konsultasjon', cta: 'Book legekonsultasjon' },
      resept: { h: 'Reseptfornyelse uten lang ventetid', who: 'Allmennlege', body: 'Trenger du å fornye en fast medisin, kan en kort konsultasjon ofte løse det. Legen vurderer alltid hva som er forsvarlig.', go: 'reseptfornyelse', cta: 'Book reseptfornyelse' },
      attest: { h: 'Legeattest hos oss', who: 'Allmennlege', body: 'Vi skriver attester til førerkort, arbeid, fritak og lignende etter en vurdering.', go: 'legeattester', cta: 'Book legeattest' },
      rynke: { h: 'En konsultasjon for rynkebehandling', who: 'Lege', body: 'Rynkebehandling er en medikamentell behandling som alltid starter med en vurdering hos lege, slik at vi finner det som passer for deg.', go: 'rynkebehandling', cta: 'Book konsultasjon' },
      hyperhidrose: { h: 'Hjelp mot overdreven svette', who: 'Lege', body: 'Plagsom svette kan behandles. Behandlingen er medikamentell og vurderes individuelt av lege ved en konsultasjon.', go: 'hyperhidrose', cta: 'Book konsultasjon' },
      helsesjekk: { h: 'En årlig helsesjekk gir deg oversikt', who: 'Lege', body: 'En grundig helsesjekk kartlegger helsen din, måler sentrale verdier og gir konkrete råd om forebygging.', go: 'arlig-helsesjekk', cta: 'Book helsesjekk' },
      vaksine: { h: 'Vaksiner og reisevaksiner', who: 'Klinikk', body: 'Vi tilbyr influensa-, hepatitt-, TBE- og reisevaksiner. Se oversikten og book det som passer din reise eller ditt behov.', href: '/vaksiner-oversikt', cta: 'Se vaksinetilbud' }
    };

    // node: { q, opts: [{t, to|res}] }
    var N = {
      start: { q: 'Hva plager deg mest akkurat nå?', opts: [
        { t: 'Hodepine eller migrene', to: 'hodepine' },
        { t: 'Svimmelhet eller balanse', to: 'svimmel' },
        { t: 'Skjelving eller risting', res: 'tremor' },
        { t: 'Nummenhet, prikking eller kraftløshet', res: 'nevroUtred' },
        { t: 'Hukommelse eller konsentrasjon', res: 'nevroUtred' },
        { t: 'Vekt og livsstil', res: 'vekt' },
        { t: 'Vanlig sykdom, resept eller attest', to: 'allmenn' },
        { t: 'Rynker eller overdreven svette', to: 'estetikk' },
        { t: 'Helsesjekk og forebygging', res: 'helsesjekk' },
        { t: 'Vaksine eller reise', res: 'vaksine' }
      ] },
      hodepine: { q: 'Har du i tillegg lysømfintlighet, kvalme eller synsforstyrrelser?', opts: [
        { t: 'Ja', res: 'hodepineMig' },
        { t: 'Nei / vet ikke', res: 'hodepineGen' }
      ] },
      svimmel: { q: 'Kom svimmelheten plutselig, eller følger den med talevansker, dobbeltsyn eller kraftløshet?', opts: [
        { t: 'Ja', res: 'svimmelAkutt' },
        { t: 'Nei — den er gradvis eller mild', res: 'svimmelMild' }
      ] },
      allmenn: { q: 'Hva trenger du hjelp med?', opts: [
        { t: 'Time med lege på video', res: 'legeVideo' },
        { t: 'Time med lege på klinikken', res: 'legeOppmote' },
        { t: 'Fornye en resept', res: 'resept' },
        { t: 'Legeattest', res: 'attest' }
      ] },
      estetikk: { q: 'Hva gjelder det?', opts: [
        { t: 'Rynker', res: 'rynke' },
        { t: 'Overdreven svette', res: 'hyperhidrose' }
      ] }
    };

    // ---- Stil (samme palett som HIT-6) ----
    var css = '#nbsr{font-family:inherit;max-width:680px;margin:0 auto}#nbsr *{box-sizing:border-box}'
      + '.sr-flag{background:#fff4ef;border:1px solid #f0c9b3;border-left:4px solid #df7f4a;border-radius:12px;padding:11px 15px;font-size:13px;color:#8a4a2a;margin-bottom:16px;line-height:1.5}'
      + '.sr-flag b{color:#c0392b}'
      + '.sr-bar{height:6px;background:#efe6da;border-radius:99px;overflow:hidden;margin:0 0 18px}'
      + '.sr-bar i{display:block;height:100%;background:#df7f4a;transition:width .3s}'
      + '.sr-q{font-weight:700;font-size:19px;margin:0 0 16px;color:#2a2420;line-height:1.3}'
      + '.sr-opts{display:flex;flex-direction:column;gap:10px}'
      + '.sr-o{display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;border:1.5px solid #e8dccc;background:#fff;border-radius:14px;padding:15px 18px;cursor:pointer;font-size:15.5px;font-family:inherit;color:#2a2420;transition:.13s;width:100%}'
      + '.sr-o:hover{border-color:#df7f4a;background:#fdeede;transform:translateX(2px)}'
      + '.sr-o .ar{color:#df7f4a;font-weight:700}'
      + '.sr-c{background:#fff;border:1px solid #e8dccc;border-radius:18px;padding:26px;box-shadow:0 8px 28px rgba(74,40,20,.06);text-align:center}'
      + '.sr-c.acute{border-color:#e3b4a6;background:#fff6f3}'
      + '.sr-who{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bd6531;background:#fdeede;border-radius:99px;padding:5px 14px;margin-bottom:12px}'
      + '.sr-c h3{font-size:23px;margin:0 0 12px;color:#2a2420;line-height:1.25}'
      + '.sr-c p{color:#6b5d52;font-size:15.5px;line-height:1.6;max-width:520px;margin:0 auto 18px}'
      + '.sr-cta{display:inline-block;background:#df7f4a;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:99px}'
      + '.sr-cta:hover{background:#bd6531}'
      + '.sr-113{display:inline-block;background:#c0392b;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:99px;margin-bottom:10px}'
      + '.sr-back{background:none;border:none;color:#6b5d52;cursor:pointer;font-family:inherit;font-size:14px;margin:16px auto 0;display:block}'
      + '.sr-note{font-size:12px;color:#8a7d70;margin-top:16px;line-height:1.5}'
      + '@media(max-width:480px){.sr-q{font-size:17px}.sr-o{font-size:14.5px;padding:13px 15px}.sr-c h3{font-size:20px}}';
    var st = document.createElement('style'); st.textContent = css; host.appendChild(st);

    var w = document.createElement('div'); w.id = 'nbsr'; host.appendChild(w);
    var flag = '<div class="sr-flag"><b>Ved akutte symptomer</b> som plutselig lammelse, talevansker, kraftig plutselig hodepine eller brystsmerter — ring <b>113</b> med en gang. Dette verktøyet er ikke for nødsituasjoner.</div>';
    var stack = ['start']; // navigasjonshistorikk (kun i minnet)

    function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

    function go(slug){ return '/bestill-time?go=' + encodeURIComponent(slug); }

    function renderNode(id){
      var node = N[id];
      var depth = stack.length - 1;
      var pct = id === 'start' ? 8 : 55;
      var back = stack.length > 1 ? '<button class="sr-back" id="srBack">← Tilbake</button>' : '';
      w.innerHTML = flag
        + '<div class="sr-bar"><i style="width:' + pct + '%"></i></div>'
        + '<p class="sr-q">' + esc(node.q) + '</p>'
        + '<div class="sr-opts">' + node.opts.map(function(o, k){
            return '<button class="sr-o" data-k="' + k + '"><span>' + esc(o.t) + '</span><span class="ar">→</span></button>';
          }).join('') + '</div>'
        + back;
      w.querySelectorAll('.sr-o').forEach(function(b){
        b.onclick = function(){
          var o = node.opts[+b.dataset.k];
          if (o.res) { stack.push('res:' + o.res); renderResult(o.res); }
          else { stack.push(o.to); renderNode(o.to); }
        };
      });
      var bk = w.querySelector('#srBack');
      if (bk) bk.onclick = function(){ stack.pop(); var prev = stack[stack.length - 1]; if (prev.indexOf('res:') === 0) renderResult(prev.slice(4)); else renderNode(prev); };
    }

    function renderResult(rid){
      var r = R[rid];
      var ctaHref = r.href ? r.href : go(r.go);
      var primary = r.acute
        ? '<a class="sr-113" href="tel:113">Ring 113</a><br><a class="sr-cta" href="' + ctaHref + '">' + esc(r.cta) + ' →</a>'
        : '<a class="sr-cta" href="' + ctaHref + '">' + esc(r.cta) + ' →</a>';
      w.innerHTML = flag
        + '<div class="sr-bar"><i style="width:100%"></i></div>'
        + '<div class="sr-c' + (r.acute ? ' acute' : '') + '">'
        + '<span class="sr-who">Anbefalt: ' + esc(r.who) + '</span>'
        + '<h3>' + esc(r.h) + '</h3>'
        + '<p>' + esc(r.body) + '</p>'
        + primary
        + '<div class="sr-note">Forslaget er veiledende og ikke en diagnose. Svarene dine lagres ikke. Er du usikker, ring oss på +47 458 17 755 — så hjelper vi deg å finne riktig time.</div>'
        + '<button class="sr-back" id="srBack">← Start på nytt</button>'
        + '</div>';
      w.querySelector('#srBack').onclick = function(){ stack = ['start']; renderNode('start'); };
    }

    renderNode('start');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
