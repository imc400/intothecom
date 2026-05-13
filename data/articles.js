/* data/articles.js — Loader del catalogo de articulos.
   El contenido vive en data/articles.json (editable via /admin panel).
   Este archivo expone window.ARTICLES + window.PLANNED_PILLARS para el SPA
   y tambien exporta CommonJS para build.js (Node side). */

(function () {
  if (typeof window === 'undefined') return;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/data/articles.json', false); // synchronous antes de mount React
    xhr.send();
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      window.ARTICLES = data.articles || [];
      window.PLANNED_PILLARS = data.plannedPillars || [];
    } else {
      window.ARTICLES = [];
      window.PLANNED_PILLARS = [];
    }
  } catch (e) {
    console.error('Failed to load articles.json:', e);
    window.ARTICLES = [];
    window.PLANNED_PILLARS = [];
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  const fs = require('fs');
  const path = require('path');
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf-8'));
  module.exports = { ARTICLES: data.articles, PLANNED_PILLARS: data.plannedPillars };
}
