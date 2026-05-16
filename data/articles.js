/* data/articles.js — Loader del catálogo de artículos.
   Browser: fetch async (no bloquea HTML parser). Dispara 'articles-ready' event.
   Node (build.js): require/CommonJS sincrónico desde el filesystem.

   Fix Agent5 #2: antes este loader hacía XHR sync que bloqueaba el parser
   80-300ms en mobile 4G. Ahora es non-blocking; componentes escuchan el evento.
*/

(function () {
  if (typeof window === 'undefined') return;
  window.ARTICLES = [];
  window.PLANNED_PILLARS = [];
  window.ARTICLES_READY = false;

  // Cache-busting: el build inyecta el hash actual de articles.json. Si está
  // sin reemplazar (dev/sin build) usa fetch normal. En producción cada deploy
  // cambia el query string, invalidando el cache del navegador automáticamente.
  var ARTICLES_VERSION = '2616489e';
  var articlesUrl = '/data/articles.json' + (ARTICLES_VERSION && ARTICLES_VERSION.indexOf('__') !== 0 ? '?v=' + ARTICLES_VERSION : '');

  window.ARTICLES_PROMISE = fetch(articlesUrl, { cache: 'default' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      window.ARTICLES = data.articles || [];
      window.PLANNED_PILLARS = data.plannedPillars || [];
      window.ARTICLES_READY = true;
      window.dispatchEvent(new Event('articles-ready'));
      return data;
    })
    .catch(function (e) {
      console.error('Failed to load articles.json:', e);
      window.ARTICLES_READY = true;
      window.dispatchEvent(new Event('articles-ready'));
    });
})();

if (typeof module !== 'undefined' && module.exports) {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf-8'));
  module.exports = { ARTICLES: data.articles, PLANNED_PILLARS: data.plannedPillars };
}
