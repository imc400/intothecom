/* Meta measurement only. No admin data, form contents or credentials in the browser payload. */
(function () {
  'use strict';
  var cookieName = 'into_meta_consent', version = '2026-10-19';
  var pixelId = window.META_PIXEL_ID || '';
  var initialized = false, sentLeads = new Set(), lastPage = '', lastPageAt = 0;
  var publicPaths = ['/', '/servicios', '/software-ia', '/paid-media', '/email-marketing', '/desarrollo-web', '/community-management', '/nosotros', '/hablemos', '/casos', '/recursos', '/equipo/ignacio-blanco'];
  function readCookie(name) {
    var part = document.cookie.split(';').map(function (s) { return s.trim(); }).find(function (s) { return s.startsWith(name + '='); });
    try { return part ? decodeURIComponent(part.slice(name.length + 1)) : ''; } catch (_) { return ''; }
  }
  function choice() { return readCookie(cookieName).split('.')[0]; }
  function accepted() { return readCookie(cookieName) === 'accepted.' + version; }
  function publicPage() {
    var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (!publicPaths.includes(path) && !/^\/recursos\/[a-z0-9-]{1,120}$/.test(path)) return false;
    for (var pair of new URLSearchParams(location.search)) if (!/^(utm_(source|medium|campaign|content|term)|fbclid|gclid|gbraid|wbraid)$/.test(pair[0]) || pair[1].length > 512 || pair[1].includes('@')) return false;
    return true;
  }
  function allowed() { return accepted() && publicPage() && /^(www\.)?intothecom\.com$/.test(location.hostname) && /^\d+$/.test(pixelId); }
  function start() {
    if (!allowed()) return false;
    if (!initialized) {
      if (!window.fbq) {
        var fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
        fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
        window.fbq = fbq; window._fbq = fbq;
      }
      window.fbq('consent', 'grant'); window.fbq('set', 'autoConfig', false, pixelId); window.fbq('init', pixelId);
      var script = document.createElement('script'); script.src = 'https://connect.facebook.net/en_US/fbevents.js'; script.async = true; document.head.appendChild(script);
      initialized = true;
    } else window.fbq('consent', 'grant');
    var suffix = '; Path=/; Max-Age=7776000; SameSite=Lax; Secure; Domain=.intothecom.com';
    if (!readCookie('_fbp')) document.cookie = '_fbp=fb.1.' + Date.now() + '.' + crypto.getRandomValues(new Uint32Array(1))[0] + suffix;
    var click = new URLSearchParams(location.search).get('fbclid');
    if (click && /^[A-Za-z0-9_-]{5,512}$/.test(click) && !readCookie('_fbc').endsWith('.' + click)) document.cookie = '_fbc=fb.1.' + Date.now() + '.' + click + suffix;
    return true;
  }
  function track(name) {
    try {
      if (!['PageView', 'Contact'].includes(name) || !start()) return;
      if (name === 'PageView') {
        if (lastPage === location.href && Date.now() - lastPageAt < 1000) return;
        lastPage = location.href; lastPageAt = Date.now();
      }
      var id = crypto.randomUUID(), params = name === 'Contact' ? { content_name: 'whatsapp_click' } : {};
      window.fbq('track', name, params, { eventID: id });
      fetch('/api/meta-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventName: name, eventId: id, url: location.href }), keepalive: true }).catch(function () {});
    } catch (_) { /* Analytics never blocks navigation or contact. */ }
  }
  window.fbqTrack = track;
  window.intoMetaLead = function (receipt) {
    try {
      if (!receipt || !/^into-lead-[a-f0-9]{64}$/.test(receipt.eventId) || sentLeads.has(receipt.eventId) || !start()) return;
      sentLeads.add(receipt.eventId);
      window.fbq('track', 'Lead', { content_name: 'brief_form' }, { eventID: receipt.eventId });
    } catch (_) { /* A delivered brief remains successful when Meta is blocked. */ }
  };
  function choose(accept) {
    document.cookie = cookieName + '=' + (accept ? 'accepted.' : 'rejected.') + version + '; Path=/; Max-Age=15552000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    if (!accept) {
      try { if (window.fbq) window.fbq('consent', 'revoke'); } catch (_) {}
      ['_fbp', '_fbc'].forEach(function (name) { ['', '; Domain=' + location.hostname, '; Domain=.intothecom.com'].forEach(function (domain) { document.cookie = name + '=; Max-Age=0; Path=/' + domain + '; SameSite=Lax'; }); });
    }
    var notice = document.getElementById('into-meta-notice'); if (notice) notice.remove();
    if (accept) track('PageView');
  }
  window.intoMetaPreferences = function () {
    if (document.getElementById('into-meta-notice')) return;
    var notice = document.createElement('section'); notice.id = 'into-meta-notice'; notice.setAttribute('aria-label', 'Medición publicitaria de Meta');
    notice.innerHTML = '<div><strong>Medición de nuestros anuncios</strong><p>Con tu permiso compartimos con Meta visitas, clics en WhatsApp y solicitudes de contacto para saber qué anuncios funcionan. Puedes rechazar y usar todos los servicios. <a href="/privacidad">Ver detalles</a>.</p></div><div class="into-meta-actions"><button type="button" data-meta-choice="reject">Rechazar</button><button type="button" data-meta-choice="accept">Aceptar medición</button></div>';
    notice.querySelector('[data-meta-choice="reject"]').addEventListener('click', function () { choose(false); });
    notice.querySelector('[data-meta-choice="accept"]').addEventListener('click', function () { choose(true); });
    document.body.appendChild(notice);
  };
  function ready() {
    if (location.pathname.startsWith('/admin')) return;
    if (!['accepted', 'rejected'].includes(choice()) || !readCookie(cookieName).endsWith('.' + version)) window.intoMetaPreferences();
    track('PageView');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
