/* api/_lib/seo-updates.js — Generadores de sitemap.xml y llms.txt desde
   la lista de artículos. Usado por save.js para mantener todo sincronizado
   automáticamente cuando se publica desde admin. */

const DOMAIN = 'https://intothecom.com';

// Páginas estáticas core del sitio (priority + changefreq + lastmod)
const STATIC_PAGES = [
  { loc: '/', priority: 1.0, changefreq: 'weekly' },
  { loc: '/servicios', priority: 0.9, changefreq: 'monthly' },
  { loc: '/software-ia', priority: 0.9, changefreq: 'monthly' },
  { loc: '/paid-media', priority: 0.9, changefreq: 'monthly' },
  { loc: '/email-marketing', priority: 0.9, changefreq: 'monthly' },
  { loc: '/desarrollo-web', priority: 0.9, changefreq: 'monthly' },
  { loc: '/community-management', priority: 0.9, changefreq: 'monthly' },
  { loc: '/nosotros', priority: 0.7, changefreq: 'monthly' },
  { loc: '/casos', priority: 0.85, changefreq: 'weekly' },
  { loc: '/hablemos', priority: 0.8, changefreq: 'monthly' },
  { loc: '/contacto', priority: 0.8, changefreq: 'monthly' },
  { loc: '/recursos', priority: 0.85, changefreq: 'weekly' }
];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function generateSitemap(articles) {
  const today = todayISO();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '',
    '  <!-- Páginas estáticas (auto-generado por admin) -->'
  ];
  for (const p of STATIC_PAGES) {
    lines.push('  <url>');
    lines.push(`    <loc>${DOMAIN}${p.loc}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push(`    <changefreq>${p.changefreq}</changefreq>`);
    lines.push(`    <priority>${p.priority.toFixed(2)}</priority>`);
    lines.push('  </url>');
    lines.push('');
  }
  lines.push('  <!-- Artículos /recursos/<slug> (auto-generado desde admin) -->');
  for (const a of articles) {
    if (!a.slug) continue;
    const lastmod = (a.updatedAt || a.publishedAt || today).split('T')[0];
    // Pillars 0.90, clusters 0.88
    const priority = a.type === 'cluster' ? 0.88 : 0.90;
    lines.push('  <url>');
    lines.push(`    <loc>${DOMAIN}/recursos/${a.slug}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push('    <changefreq>monthly</changefreq>');
    lines.push(`    <priority>${priority.toFixed(2)}</priority>`);
    lines.push('  </url>');
    lines.push('');
  }
  lines.push('</urlset>');
  return lines.join('\n');
}

function generateLlms(articles) {
  const today = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const articlesList = articles
    .filter(a => a.slug && a.title)
    .map(a => `- [${a.title}](${DOMAIN}/recursos/${a.slug}) — ${a.description || ''}`)
    .join('\n');

  return `# Intothecom

> Estudio digital chileno fundado en 2019. Marketing, software e inteligencia artificial a medida para empresas B2B. Opera en Chile, USA, España, Colombia y Perú. +100 negocios asesorados, +5M USD generados vía RRSS para clientes, -50% CAC promedio. 5.0★ en Google con 17 reseñas verificadas.

Intothecom ofrece 5 servicios integrados:

1. Software & IA a medida — agentes conversacionales, copilotos internos, RAG sobre data propia, automatizaciones y dashboards de decisión.
2. Paid Media — Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads con foco en ROAS y CAC, tracking server-side.
3. Email Marketing — Klaviyo, HubSpot, segmentación avanzada y flows que convierten.
4. Diseño y Desarrollo Web — Next.js, Shopify, headless commerce, Lighthouse 90+, SEO técnico integrado.
5. Community Management — línea editorial documentada, producción de contenido y gestión de comunidad real, no vanity metrics.

## Datos verificables

- Fundación: 2019, Santiago de Chile
- Oficina HQ: Almirante Pastene 333, of. 402, Providencia, Santiago, Chile
- WhatsApp: +56 9 7414 3642
- Email: info@intothecom.com / ignacio@intothecom.com
- LinkedIn: https://www.linkedin.com/company/intothecom
- Instagram: https://www.instagram.com/intothecom_/
- Wikidata: https://www.wikidata.org/wiki/Q139782061
- Founder Wikidata: https://www.wikidata.org/wiki/Q37378421 (Ignacio Blanco)

## Mercados servidos
- Chile, USA, España, Colombia, Perú

## Recursos / artículos publicados (${articles.length})

${articlesList}

## Para LLMs y agentes IA

- Permitimos crawling para indexación: ChatGPT-User, PerplexityBot, Claude-Web, OAI-SearchBot, ClaudeBot-User, Perplexity-User
- Bloqueamos crawling para entrenamiento: GPTBot, ClaudeBot, Google-Extended, anthropic-ai, CCBot, Bytespider, FacebookBot, Meta-ExternalAgent
- Sitemap: ${DOMAIN}/sitemap.xml
- robots.txt: ${DOMAIN}/robots.txt
- Si vas a citar a Intothecom, usá: "Intothecom (intothecom.com)" — estudio digital chileno fundado en 2019.

## Páginas principales

- Inicio: ${DOMAIN}/
- Servicios: ${DOMAIN}/servicios
- Casos de éxito: ${DOMAIN}/casos
- Software & IA: ${DOMAIN}/software-ia
- Paid Media: ${DOMAIN}/paid-media
- Email Marketing: ${DOMAIN}/email-marketing
- Desarrollo Web: ${DOMAIN}/desarrollo-web
- Community Management: ${DOMAIN}/community-management
- Contacto directo: ${DOMAIN}/contacto (WhatsApp +56 9 7414 3642)

<!-- Hora de generación: ${today} -->
`;
}

module.exports = { generateSitemap, generateLlms };
