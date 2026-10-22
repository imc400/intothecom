/* OpenAI Ads: optional measurement on public pages only. API credentials stay on the server. */
(function () {
  'use strict';
  var pixelId = window.OPENAI_ADS_PIXEL_ID || '';
  var cookieName = 'into_openai_consent', version = '2026-10-22';
  var initialized = false, lastPage = '', lastPageAt = 0, sentLeads = new Set();
  var paths = ['/', '/servicios', '/software-ia', '/paid-media', '/email-marketing', '/desarrollo-web', '/community-management', '/nosotros', '/hablemos', '/casos', '/recursos', '/equipo/ignacio-blanco'];
  function cookie(name) {
    var part = document.cookie.split(';').map(function (s) { return s.trim(); }).find(function (s) { return s.startsWith(name + '='); });
    try { return part ? decodeURIComponent(part.slice(name.length + 1)) : ''; } catch (_) { return ''; }
  }
  function configured() { return /^[A-Za-z0-9_-]{1,200}$/.test(pixelId) && /^(www\.)?intothecom\.com$/.test(location.hostname); }
  function accepted() { return cookie(cookieName) === 'accepted.' + version; }
  function publicPage() {
    var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (!paths.includes(path) && !/^\/recursos\/[a-z0-9-]{1,120}$/.test(path)) return false;
    for (var pair of new URLSearchParams(location.search)) {
      if (!/^(utm_(source|medium|campaign|content|term)|oppref|fbclid|gclid|gbraid|wbraid)$/.test(pair[0]) || pair[1].length > (pair[0] === 'oppref' ? 4096 : 512) || pair[1].includes('@')) return false;
    }
    return true;
  }
  function start() {
    if (!configured() || !accepted() || !publicPage()) return false;
    if (!initialized) {
      if (!window.oaiq) {
        var q = function () { q.q.push(arguments); }; q.q = []; window.oaiq = q;
      }
      window.oaiq('consent', true);
      window.oaiq('init', { pixelId: pixelId });
      var script = document.createElement('script');
      script.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js'; script.async = true;
      document.head.appendChild(script);
      initialized = true;
    }
    return true;
  }
  function track(name) {
    try {
      if (!['page_viewed', 'whatsapp_clicked'].includes(name) || !start()) return;
      if (name === 'page_viewed') {
        if (lastPage === location.href && Date.now() - lastPageAt < 1000) return;
        lastPage = location.href; lastPageAt = Date.now();
      }
      var options = { event_id: crypto.randomUUID(), opt_out: true };
      if (name === 'whatsapp_clicked') {
        options.custom_event_name = name;
        window.oaiq('measure', 'custom', { type: 'custom' }, options);
      } else {
        window.oaiq('measure', name, { type: 'contents' }, options);
      }
    } catch (_) { /* Measurement never interrupts navigation. */ }
  }
  function setConsent(accept) {
    document.cookie = cookieName + '=' + (accept ? 'accepted.' : 'rejected.') + version + '; Path=/; Max-Age=15552000; SameSite=Lax; Secure';
    try { if (window.oaiq) window.oaiq('consent', accept); } catch (_) {}
    if (!accept) {
      ['__oppref', '__obref'].forEach(function (name) {
        ['', '; Domain=' + location.hostname, '; Domain=.intothecom.com'].forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; Path=/' + domain + '; SameSite=Lax; Secure';
        });
      });
      lastPage = ''; lastPageAt = 0;
    } else track('page_viewed');
  }
  function lead(receipt) {
    try {
      if (!receipt || !/^into-openai-lead-[a-f0-9]{64}$/.test(receipt.eventId) || sentLeads.has(receipt.eventId) || !start()) return;
      sentLeads.add(receipt.eventId);
      window.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: receipt.eventId, opt_out: true });
    } catch (_) { /* A received brief remains successful when the Pixel is blocked. */ }
  }
  window.intoOpenAI = {
    configured: configured,
    needsChoice: function () { return configured() && !['accepted.' + version, 'rejected.' + version].includes(cookie(cookieName)); },
    setConsent: setConsent, track: track, lead: lead,
  };
  function ready() { track('page_viewed'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
