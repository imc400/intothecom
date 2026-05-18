/* Build pipeline — mayo 2026.
   1. Compila JSX con esbuild → dist/*.js (elimina Babel runtime ~870KB).
   2. Calcula hash content-based de cada bundle para cache busting.
   3. Inyecta los hashes en los src de los scripts en el master HTML.
   4. Pre-renderiza HTML por ruta para que cada URL tenga meta tags + JSON-LD
      correctos sin depender de JS. Crítico para AI bots (ChatGPT-User,
      PerplexityBot, Claude-Web) que no ejecutan JavaScript al crawlear.
   5. Genera noscript fallback con texto resumen para SEO técnico.

   Cache busting: vercel.json sirve /dist/* con Cache-Control immutable
   (max-age=1año). Para que browsers reciban actualizaciones, agregamos
   ?v=<contentHash> a cada src — query string cambia → URL nueva → cache nuevo.

   Run: `npm run build` (también automático en Vercel via package.json).
*/

const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const outdir = path.join(root, 'dist');
fs.mkdirSync(outdir, { recursive: true });

function contentHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

const entries = [
  'components/shared.jsx',
  'components/page-home.jsx',
  'components/pages.jsx',
  'components/page-recursos.jsx',
  'components/app.jsx',
  'components/admin.jsx',
];

// === ROUTE METADATA (debe espejar ROUTE_META en components/app.jsx) ===
const ROUTE_META = {
  '/': {
    title: 'Intothecom · Marketing, software & IA para crecer en serio',
    description: 'Estudio digital con +100 negocios asesorados. Paid media, email, web, community y agentes de IA a medida. Chile, USA, España, Colombia, Perú.',
    noscript: 'Intothecom es un estudio digital chileno fundado en 2019. Ofrece 5 servicios integrados: Software & IA a medida, Paid Media, Email Marketing, Diseño y Desarrollo Web, y Community Management. +100 negocios asesorados en Chile, USA, España, Colombia y Perú. Contacto: WhatsApp +56 9 7414 3642 · info@intothecom.com.',
    breadcrumb: [{name: 'Inicio', path: '/'}]
  },
  '/servicios': {
    title: 'Servicios · Marketing digital, software e IA | Intothecom',
    description: '5 servicios integrados: paid media, email marketing, desarrollo web, community y software & IA. Diseñados para escalar tu negocio con datos.',
    noscript: 'Catálogo completo de los 5 servicios de Intothecom: Software & IA a medida, Paid Media (Google, Meta, TikTok, LinkedIn), Email Marketing (Klaviyo, HubSpot), Diseño y Desarrollo Web (Next.js, Shopify headless) y Community Management. Cotiza por WhatsApp +56 9 7414 3642.',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}]
  },
  '/software-ia': {
    title: 'Software & IA a medida · Agentes y automatizaciones | Intothecom',
    description: 'Construimos agentes conversacionales, copilotos internos, RAG sobre tu data y dashboards de decisión. De idea a producción en 6 semanas.',
    noscript: 'Software & IA a medida de Intothecom: agentes conversacionales, copilotos internos, RAG sobre data propia, automatizaciones con n8n/Make y dashboards de decisión. De idea a producción en 6 semanas. Prototipo funcional en 3 semanas. Para empresas B2B en CL, BR, US, ES.',
    ogImage: '/assets/og/software-ia.jpg',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}, {name: 'Software & IA', path: '/software-ia'}]
  },
  '/paid-media': {
    title: 'Paid Media · Google, Meta, TikTok y LinkedIn | Intothecom',
    description: 'Campañas con foco en ROAS y CAC. Tracking server-side, creatividades A/B y reportes con decisiones. Escalamos lo que funciona, no impresiones.',
    noscript: 'Paid Media B2B con Intothecom: campañas en Google Ads, Meta Ads, TikTok Ads y LinkedIn Ads con foco en ROAS y CAC. Tracking server-side, Conversions API, creatividades A/B y reportes con decisiones. Resultados visibles en 2-3 semanas. Sin tercerización a freelancers.',
    ogImage: '/assets/og/paid-media.jpg',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}, {name: 'Paid Media', path: '/paid-media'}]
  },
  '/email-marketing': {
    title: 'Email Marketing · Klaviyo, HubSpot y flows que venden | Intothecom',
    description: 'Email marketing con segmentación quirúrgica, automatizaciones y A/B test continuo. Convierte 4–6× más que social. Tu canal más rentable.',
    noscript: 'Email Marketing Automation con Intothecom: Klaviyo y HubSpot, segmentación avanzada, flows transaccionales, campañas, A/B test continuo. Primer flow en vivo en 30 días. Convierte 4-6× más que redes sociales. Para e-commerce y B2B en LATAM, USA y España.',
    ogImage: '/assets/og/email-marketing.jpg',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}, {name: 'Email Marketing', path: '/email-marketing'}]
  },
  '/desarrollo-web': {
    title: 'Diseño y Desarrollo Web · Next.js y Shopify Headless | Intothecom',
    description: 'Sitios y e-commerce con Lighthouse 90+, SEO técnico y CMS editable por tu equipo. UI/UX y código bajo el mismo techo, listos para vender.',
    noscript: 'Diseño y Desarrollo Web con Intothecom: sitios institucionales y e-commerce headless con Next.js + Shopify. Lighthouse 90+. SEO técnico integrado. CMS editable. UI/UX y código bajo el mismo techo. Para empresas B2B y D2C en Chile, LATAM, USA y España.',
    ogImage: '/assets/og/desarrollo-web.jpg',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}, {name: 'Desarrollo Web', path: '/desarrollo-web'}]
  },
  '/community-management': {
    title: 'Community Management · Contenido y comunidad B2B | Intothecom',
    description: 'Línea editorial documentada, producción mensual de foto y video, gestión de DMs y crisis. Comunidad que compra, no vanity metrics.',
    noscript: 'Community Management con Intothecom: línea editorial documentada, producción mensual de foto y video, gestión de DMs y crisis management. Instagram, TikTok y LinkedIn. Comunidad que compra, no vanity metrics. Reportes mensuales con métricas reales.',
    ogImage: '/assets/og/community-management.jpg',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}, {name: 'Community Management', path: '/community-management'}]
  },
  '/nosotros': {
    title: 'Nosotros · Estudio digital desde 2019 | Intothecom',
    description: '+5 años, +100 negocios y 4 mercados. Una agencia con obsesión por los datos: si no se puede medir, no lo hacemos. Equipo senior dedicado.',
    noscript: 'Nosotros · Intothecom es un estudio digital chileno fundado en 2019. +5 años de operación, +100 negocios asesorados, +5M USD generados vía RRSS para clientes, -50% CAC promedio. 5.0★ en Google con 17 reseñas. Mercados: Chile, USA, España, Colombia, Perú. Equipo senior in-house.',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Nosotros', path: '/nosotros'}]
  },
  '/hablemos': {
    title: 'Hablemos · Cotiza tu proyecto en menos de 1 hora | Intothecom',
    description: 'Escríbenos por WhatsApp o brief. Respuesta < 1h hábil. Primera reunión sin costo de 45 min con auditoría aplicable. Lun–Vie 9–19 SCL.',
    noscript: 'Hablemos · Cotiza tu proyecto con Intothecom en menos de 1 hora. WhatsApp +56 9 7414 3642. Primera reunión sin costo de 45 min con auditoría aplicable al proyecto. Lunes a Viernes 9:00-19:00 hora Santiago. Equipo senior responde directamente.',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Hablemos', path: '/hablemos'}]
  },
  '/contacto': {
    title: 'Contacto · Oficina, WhatsApp, email | Intothecom',
    description: 'Almirante Pastene 333, of. 402, Providencia, Santiago. WhatsApp +56 9 7414 3642 · info@intothecom.com · ignacio@intothecom.com.',
    noscript: 'Contacto Intothecom: Almirante Pastene 333, oficina 402, Providencia, Santiago, Chile. WhatsApp +56 9 7414 3642. Email: info@intothecom.com / ignacio@intothecom.com. Horario: Lunes a Viernes 9:00-19:00 hora Santiago. Operamos en Chile, USA, España, Colombia y Perú.',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Contacto', path: '/contacto'}]
  },
  '/casos': {
    title: 'Casos de éxito · Resultados verificables | Intothecom',
    description: 'Casos seleccionados con métricas reales. Equifax, Bullpadel, Imanix y +100 marcas. Cuando los datos hablan, la propuesta sobra.',
    noscript: 'Casos de éxito de Intothecom: trabajamos con +100 marcas verificables incluyendo Equifax, Bullpadel, Imanix, Granja Magdalena, Toke, Parque Termal Botánico, Rebels Golf, Spot Essence, CIPO y más. Métricas reales y verificables disponibles bajo solicitud.',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Casos de éxito', path: '/casos'}]
  },
  '/recursos': {
    title: 'Recursos · Guías técnicas de marketing B2B LATAM | Intothecom',
    description: 'Pillar pages y benchmarks de marketing digital B2B LATAM, GEO, AEO, paid media, email automation y agentes IA. Por consultores con +100 implementaciones.',
    noscript: 'Recursos Intothecom: blog con pillar pages y guías técnicas sobre marketing digital B2B en LATAM, Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), paid media B2B, email marketing automation con Klaviyo y HubSpot, desarrollo web headless con Next.js y Shopify, agentes IA empresariales, y community management estratégico. Editado por consultores con +100 implementaciones reales en Chile, USA, España, Colombia y Perú.',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Recursos', path: '/recursos'}]
  }
};

// === ARTÍCULOS DEL BLOG (cargados desde data/articles.js) ===
// Para pre-render por artículo, cargamos el módulo y generamos HTMLs en /recursos/<slug>.html
let ARTICLES = [];
try {
  const articlesModule = require(path.join(root, 'data', 'articles.js'));
  ARTICLES = articlesModule.ARTICLES || [];
} catch (e) {
  console.warn('⚠️  No se pudo cargar data/articles.js:', e.message);
}

// === SSR CONTENT POR RUTA (cargado desde data/ssr-content.js) ===
// Necesario para que Google AdsBot vea contenido único y visible por landing.
// Sin esto, AdsBot rechaza anuncios por "contenido original insuficiente"
// porque todas las URLs entregan el mismo shell genérico.
let SSR_CONTENT = {};
let SSR_COMMON = { COMMON_NAV: [], COMMON_FOOTER: {} };
try {
  const ssrModule = require(path.join(root, 'data', 'ssr-content.js'));
  SSR_CONTENT = ssrModule.SSR_CONTENT || {};
  SSR_COMMON.COMMON_NAV = ssrModule.COMMON_NAV || [];
  SSR_COMMON.COMMON_FOOTER = ssrModule.COMMON_FOOTER || {};
} catch (e) {
  console.warn('⚠️  No se pudo cargar data/ssr-content.js:', e.message);
}

const DOMAIN = 'https://www.intothecom.com';

/* SSR rendering helpers — generan HTML semántico visible por ruta.
   Crítico: nada off-screen, ningún display:none, ningún visibility:hidden.
   AdsBot debe ver contenido REAL al rastrear la URL sin ejecutar JS. */

function ssrEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSSRNav(currentPath) {
  const items = SSR_COMMON.COMMON_NAV.map(item => {
    const isActive = item.path === currentPath;
    const aria = isActive ? ' aria-current="page"' : '';
    return `<li><a href="${ssrEscape(item.path)}"${aria}>${ssrEscape(item.label)}</a></li>`;
  }).join('');
  return `<nav class="ssr-nav" aria-label="Navegación principal"><ul>${items}</ul></nav>`;
}

function renderSSRCTAs(ctas) {
  if (!Array.isArray(ctas) || ctas.length === 0) return '';
  const buttons = ctas.map(cta => {
    const cls = cta.primary ? 'ssr-btn ssr-btn-primary' : 'ssr-btn ssr-btn-ghost';
    const attrs = cta.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="${cls}" href="${ssrEscape(cta.href)}"${attrs}>${ssrEscape(cta.text)} ↗</a>`;
  }).join('');
  return `<div class="ssr-cta-row">${buttons}</div>`;
}

function renderSSRMeta(meta) {
  if (!Array.isArray(meta) || meta.length === 0) return '';
  const rows = meta.map(m => `<div class="ssr-meta-row"><span>${ssrEscape(m.label)}</span><span>${ssrEscape(m.value)}</span></div>`).join('');
  return `<div class="ssr-meta">${rows}</div>`;
}

function renderSSRStats(stats) {
  if (!Array.isArray(stats) || stats.length === 0) return '';
  const items = stats.map(s => {
    const sub = s.sub ? `<div class="ssr-stat-sub">${ssrEscape(s.sub)}</div>` : '';
    return `<div class="ssr-stat"><div class="ssr-stat-num">${ssrEscape(s.num)}</div><div class="ssr-stat-lbl">${ssrEscape(s.label)}</div>${sub}</div>`;
  }).join('');
  return `<div class="ssr-stats">${items}</div>`;
}

function renderSSRBullets(items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `<ul class="ssr-bullets">${items.map(b => `<li>${ssrEscape(b)}</li>`).join('')}</ul>`;
}

function renderSSRSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return '';
  const items = steps.map((s, i) => `
    <li class="ssr-step">
      <span class="ssr-step-num">0${i + 1}</span>
      <div>
        <h3>${ssrEscape(s.t)}</h3>
        <p>${ssrEscape(s.d)}</p>
      </div>
    </li>`).join('');
  return `<ol class="ssr-steps">${items}</ol>`;
}

function renderSSRServices(services) {
  if (!Array.isArray(services) || services.length === 0) return '';
  const items = services.map(s => `
    <li class="ssr-service">
      <span class="ssr-service-num">${ssrEscape(s.num)}</span>
      <a class="ssr-service-link" href="${ssrEscape(s.path)}">
        <h3>${ssrEscape(s.t)}</h3>
        <p>${ssrEscape(s.desc)}</p>
      </a>
    </li>`).join('');
  return `<ul class="ssr-services">${items}</ul>`;
}

function renderSSRContactGrid(grid) {
  if (!Array.isArray(grid) || grid.length === 0) return '';
  const items = grid.map(c => {
    const inner = c.href
      ? `<a href="${ssrEscape(c.href)}"${c.href.startsWith('http') && !c.href.includes('intothecom.com') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${ssrEscape(c.value)}</a>`
      : ssrEscape(c.value);
    return `<div class="ssr-contact-cell"><div class="ssr-contact-lbl">${ssrEscape(c.label)}</div><div class="ssr-contact-val">${inner}</div></div>`;
  }).join('');
  return `<div class="ssr-contact-grid">${items}</div>`;
}

function renderSSRFAQ(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return '';
  const items = faq.map(qa => `
    <div class="ssr-faq-item">
      <h3 class="ssr-faq-q">${ssrEscape(qa.q)}</h3>
      <p class="ssr-faq-a">${ssrEscape(qa.a)}</p>
    </div>`).join('');
  return `<section class="ssr-faq" aria-labelledby="ssr-faq-title">
    <h2 id="ssr-faq-title">Preguntas frecuentes</h2>
    ${items}
  </section>`;
}

function renderSSRSection(section) {
  const parts = [];
  if (section.eyebrow) parts.push(`<div class="ssr-eyebrow">${ssrEscape(section.eyebrow)}</div>`);
  if (section.h2) parts.push(`<h2>${ssrEscape(section.h2)}</h2>`);
  if (section.body) parts.push(`<p>${ssrEscape(section.body)}</p>`);
  if (section.bullets) parts.push(renderSSRBullets(section.bullets));
  if (section.steps) parts.push(renderSSRSteps(section.steps));
  if (section.services) parts.push(renderSSRServices(section.services));
  if (section.contactGrid) parts.push(renderSSRContactGrid(section.contactGrid));
  return `<section class="ssr-section">${parts.join('\n')}</section>`;
}

function renderSSRFooter() {
  const f = SSR_COMMON.COMMON_FOOTER;
  const services = (f.services || []).map(s => `<li><a href="${ssrEscape(s.path)}">${ssrEscape(s.label)}</a></li>`).join('');
  return `<footer class="ssr-footer">
    <div class="ssr-footer-col">
      <h3>Intothecom</h3>
      <p>${ssrEscape(f.address || '')}</p>
      <p><strong>Mercados:</strong> ${ssrEscape(f.markets || '')}</p>
      <p><strong>Horario:</strong> ${ssrEscape(f.hours || '')}</p>
    </div>
    <div class="ssr-footer-col">
      <h3>Servicios</h3>
      <ul>${services}</ul>
    </div>
    <div class="ssr-footer-col">
      <h3>Contacto</h3>
      <p><a href="mailto:${ssrEscape(f.email)}">${ssrEscape(f.email)}</a></p>
      <p><a href="${ssrEscape(f.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp ${ssrEscape(f.phone)}</a></p>
    </div>
  </footer>`;
}

function renderSSRPage(route, ssrData, meta) {
  if (!ssrData) return '';

  const hero = ssrData.hero || {};
  const heroParts = [];
  if (hero.eyebrow) heroParts.push(`<div class="ssr-eyebrow">${ssrEscape(hero.eyebrow)}</div>`);
  if (hero.h1) heroParts.push(`<h1>${ssrEscape(hero.h1)}</h1>`);
  if (hero.body) heroParts.push(`<p class="ssr-lead">${ssrEscape(hero.body)}</p>`);
  if (hero.ctas) heroParts.push(renderSSRCTAs(hero.ctas));
  if (hero.meta) heroParts.push(renderSSRMeta(hero.meta));

  const sections = (ssrData.sections || []).map(renderSSRSection).join('\n');
  const stats = ssrData.stats ? renderSSRStats(ssrData.stats) : '';
  const others = ssrData.others ? `
    <section class="ssr-section">
      <div class="ssr-eyebrow">/ otros servicios</div>
      <h2>Más disciplinas del estudio.</h2>
      ${renderSSRServices(ssrData.others)}
    </section>` : '';
  const faq = ssrData.faq ? renderSSRFAQ(ssrData.faq) : '';

  return `<div class="ssr-shell" data-route="${ssrEscape(route)}">
  ${renderSSRNav(route)}
  <main class="ssr-main">
    <section class="ssr-hero">
      ${heroParts.join('\n')}
    </section>
    ${stats}
    ${sections}
    ${others}
    ${faq}
  </main>
  ${renderSSRFooter()}
</div>`;
}

function buildBreadcrumbJSON(crumbs) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": c.name,
      "item": `${DOMAIN}${c.path === '/' ? '/' : c.path}`
    }))
  }, null, 2);
}

function prerenderRoute(masterHtml, route, meta) {
  let html = masterHtml;
  const url = `${DOMAIN}${route === '/' ? '/' : route}`;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${meta.description}"/>`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}"/>`
  );

  // Replace OG title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${meta.title}"/>`
  );

  // Replace OG description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${meta.description}"/>`
  );

  // Replace OG URL
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}"/>`
  );

  // Replace OG image (per-route si existe asset, sino fallback al cover global)
  if (meta.ogImage) {
    const ogImageUrl = `${DOMAIN}${meta.ogImage}`;
    html = html.replace(
      /<meta property="og:image" content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ogImageUrl}"/>`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${ogImageUrl}"/>`
    );
  }

  // Replace Twitter title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${meta.title}"/>`
  );

  // Replace Twitter description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${meta.description}"/>`
  );

  // Replace BreadcrumbList JSON-LD
  const breadcrumbJSON = buildBreadcrumbJSON(meta.breadcrumb);
  html = html.replace(
    /<script type="application\/ld\+json" id="ld-breadcrumb">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="ld-breadcrumb">\n${breadcrumbJSON}\n</script>`
  );

  // FIX CRIT-1: Update WebPage schema per route (no usar siempre el del home)
  const webPageId = `${DOMAIN}${route === '/' ? '/' : route}#webpage`;
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webPageId,
    "url": url,
    "name": meta.title,
    "isPartOf": {"@id": `${DOMAIN}/#website`},
    "about": {"@id": `${DOMAIN}/#org`},
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": route === '/'
        ? [".hero-headline", ".lead", ".hero-stat", ".faq-q-text", ".faq-a"]
        : (route.startsWith('/recursos/') ? [".article-tldr", ".article-h1", ".faq-q-text", ".faq-a"] : [".hero-headline", ".lead", ".faq-q-text", ".faq-a"])
    },
    "inLanguage": "es-CL"
  };
  html = html.replace(
    /<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"WebPage"[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(webPageSchema, null, 2)}\n</script>`
  );

  // FIX CRIT-2: Remove home FAQPage from non-home pages (FAQ del home no se ve en otras rutas → schema invisible → penalizable)
  if (route !== '/') {
    html = html.replace(
      /<!-- Structured data: FAQ -->\s*<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"FAQPage",\s*"@id":\s*"https:\/\/intothecom\.com\/#faq"[\s\S]*?<\/script>/,
      '<!-- FAQ schema removed from non-home pages: content not visible here -->'
    );
  }

  // Hreflang per route — fix Agent5 #6: subpáginas deben self-reference, no apuntar al home
  // Estrategia simple: una sola entrada hreflang="es" + x-default apuntando a la propia URL
  const hreflangBlock = `<link rel="alternate" hreflang="es" href="${url}"/>\n<link rel="alternate" hreflang="x-default" href="${url}"/>`;
  // Eliminar TODOS los hreflang previos (cualquier locale)
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*"\s*\/?>\s*/g, '');
  // Inyectar nuevos antes del canonical
  html = html.replace(/<link rel="canonical"/, `${hreflangBlock}\n<link rel="canonical"`);

  // FIX Agent5 #5: limpiar noscripts duplicados previos antes de inyectar el nuevo
  // El regex anterior solo agregaba, nunca eliminaba; por eso se acumulaban en cada build.
  html = html.replace(/<noscript>\s*<div style="max-width:720px[\s\S]*?<\/div>\s*<\/noscript>\s*/g, '');

  // Inject noscript fallback before </body> (crítico para AI bots sin JS)
  if (meta.noscript) {
    const noscriptBlock = `<noscript>
  <div style="max-width:720px;margin:48px auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.6;color:#1a1a1d;">
    <h1>${meta.title}</h1>
    <p>${meta.noscript}</p>
    <p><strong>Contacto:</strong> WhatsApp <a href="https://wa.me/56974143642">+56 9 7414 3642</a> · <a href="mailto:info@intothecom.com">info@intothecom.com</a></p>
    <p><strong>Servicios:</strong> <a href="/software-ia">Software & IA</a> · <a href="/paid-media">Paid Media</a> · <a href="/email-marketing">Email Marketing</a> · <a href="/desarrollo-web">Desarrollo Web</a> · <a href="/community-management">Community Management</a></p>
  </div>
</noscript>`;
    html = html.replace(/<\/body>/, noscriptBlock + '\n</body>');
  }

  // === Inyectar SSR content visible específico por ruta ===
  // Reemplaza TODO el contenido entre <!--SSR_START--> y <!--SSR_END--> con HTML
  // semántico real para esta URL. Crítico para Google AdsBot (que no ejecuta JS
  // como Googlebot) y para LLM crawlers que leen HTML inicial.
  //
  // El contenido es VISIBLE (no off-screen, no display:none). React lo reemplaza
  // al montar via createRoot.render(), lo cual es comportamiento estándar de SPA.
  const ssrData = SSR_CONTENT[route];
  const ssrHtml = ssrData ? renderSSRPage(route, ssrData, meta) : '';
  if (ssrHtml) {
    html = html.replace(
      /<!--SSR_START-->[\s\S]*?<!--SSR_END-->/,
      `<!--SSR_START-->\n${ssrHtml}\n<!--SSR_END-->`
    );
  }

  return html;
}

async function run() {
  // 1. Compile JSX
  console.log('🔨 Compiling JSX with esbuild...');
  await build({
    entryPoints: entries,
    bundle: false,
    outdir,
    loader: { '.jsx': 'jsx' },
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    minify: true,
    target: ['es2020'],
    logLevel: 'info',
    outExtension: { '.js': '.js' },
  });
  console.log('   ✓ Build complete →', outdir);

  // 1b. Compute content hashes for cache busting
  console.log('\n🔐 Computing content hashes for cache busting...');
  const hashes = {
    'shared.js': contentHash(path.join(outdir, 'shared.js')),
    'page-home.js': contentHash(path.join(outdir, 'page-home.js')),
    'pages.js': contentHash(path.join(outdir, 'pages.js')),
    'page-recursos.js': contentHash(path.join(outdir, 'page-recursos.js')),
    'app.js': contentHash(path.join(outdir, 'app.js'))
  };
  // articles.json es la fuente real → su hash es el que invalida cache cuando
  // publicamos artículos nuevos. Inyectamos ese hash dentro de data/articles.js
  // para que el fetch incluya ?v=<hash>, evitando que clientes con cache viejo
  // queden mostrando 404 en artículos recién publicados.
  const articlesJsonHash = contentHash(path.join(root, 'data', 'articles.json'));
  const articlesJsPath = path.join(root, 'data', 'articles.js');
  let articlesJsSrc = fs.readFileSync(articlesJsPath, 'utf-8');
  const newArticlesJs = articlesJsSrc.replace(/var ARTICLES_VERSION = '[^']*';/, `var ARTICLES_VERSION = '${articlesJsonHash}';`);
  if (newArticlesJs !== articlesJsSrc) {
    fs.writeFileSync(articlesJsPath, newArticlesJs);
    console.log('   ✓ Inyectado ARTICLES_VERSION en data/articles.js:', articlesJsonHash);
  }
  const articlesHash = contentHash(articlesJsPath);
  console.log('   shared.js:', hashes['shared.js']);
  console.log('   page-home.js:', hashes['page-home.js']);
  console.log('   pages.js:', hashes['pages.js']);
  console.log('   page-recursos.js:', hashes['page-recursos.js']);
  console.log('   app.js:', hashes['app.js']);
  console.log('   data/articles.js:', articlesHash);
  console.log('   data/articles.json:', articlesJsonHash);

  // 2. Prerender HTML per route
  console.log('\n📄 Prerendering per-route HTML files...');
  let masterHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');

  // Inyectar cache busting versions en los src
  // articles.js ahora es fetch async internamente → defer es seguro y mejora FCP
  masterHtml = masterHtml.replace(/<script(\s+defer)?\s+src="\/data\/articles\.js(\?v=[a-f0-9]+)?"/, `<script defer src="/data/articles.js?v=${articlesHash}"`);
  masterHtml = masterHtml.replace(/src="\/dist\/shared\.js(\?v=[a-f0-9]+)?"/, `src="/dist/shared.js?v=${hashes['shared.js']}"`);
  masterHtml = masterHtml.replace(/src="\/dist\/page-home\.js(\?v=[a-f0-9]+)?"/, `src="/dist/page-home.js?v=${hashes['page-home.js']}"`);
  masterHtml = masterHtml.replace(/src="\/dist\/pages\.js(\?v=[a-f0-9]+)?"/, `src="/dist/pages.js?v=${hashes['pages.js']}"`);
  masterHtml = masterHtml.replace(/src="\/dist\/page-recursos\.js(\?v=[a-f0-9]+)?"/, `src="/dist/page-recursos.js?v=${hashes['page-recursos.js']}"`);
  masterHtml = masterHtml.replace(/src="\/dist\/app\.js(\?v=[a-f0-9]+)?"/, `src="/dist/app.js?v=${hashes['app.js']}"`);

  // 1c. Inyectar cache busting en admin/index.html
  const adminHash = contentHash(path.join(outdir, 'admin.js'));
  hashes['admin.js'] = adminHash;
  console.log('   admin.js:', adminHash);
  const adminHtmlPath = path.join(root, 'admin', 'index.html');
  if (fs.existsSync(adminHtmlPath)) {
    let adminHtml = fs.readFileSync(adminHtmlPath, 'utf-8');
    adminHtml = adminHtml.replace(/src="\/dist\/admin\.js(\?v=[a-f0-9]+)?"/, `src="/dist/admin.js?v=${adminHash}"`);
    fs.writeFileSync(adminHtmlPath, adminHtml, 'utf-8');
    console.log('   ✓ admin/index.html updated with hash');
  }
  let count = 0;

  for (const [route, meta] of Object.entries(ROUTE_META)) {
    if (route === '/') continue; // index.html ya es el home

    const html = prerenderRoute(masterHtml, route, meta);
    const slug = route.replace('/', '');
    const outPath = path.join(root, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`   ✓ ${slug}.html`);
    count++;
  }

  // 3. Update master index.html con noscript fallback también
  const homeMeta = ROUTE_META['/'];
  const homeHtml = prerenderRoute(masterHtml, '/', homeMeta);
  fs.writeFileSync(path.join(root, 'index.html'), homeHtml, 'utf-8');
  console.log(`   ✓ index.html (updated with noscript fallback)`);

  // Helpers para renderizar sections como HTML estático (NO solo para schemas)
  // Soporta el mismo parser inline-markdown que el componente React (negrita + internal links)
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function parseInlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
  function renderSectionsToHTML(sections) {
    if (!Array.isArray(sections)) return '';
    return sections.map(s => {
      if (s.type === 'h2') return `<h2 id="${escapeHtml(s.id || '')}">${parseInlineMarkdown(s.text)}</h2>`;
      if (s.type === 'h3') return `<h3 id="${escapeHtml(s.id || '')}">${parseInlineMarkdown(s.text)}</h3>`;
      if (s.type === 'p') return `<p>${parseInlineMarkdown(s.text)}</p>`;
      if (s.type === 'list') {
        const items = (s.items || []).map(it => `<li>${parseInlineMarkdown(it)}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      if (s.type === 'table') {
        const thead = `<thead><tr>${(s.headers || []).map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${(s.rows || []).map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="article-table-wrap"><table class="article-table">${thead}${tbody}</table></div>`;
      }
      if (s.type === 'cta') return `<div class="article-cta"><a href="https://wa.me/56974143642" target="_blank" rel="noopener noreferrer">${escapeHtml(s.text)} ↗</a></div>`;
      return '';
    }).join('\n');
  }
  // Texto plano (para articleBody schema) — sin HTML tags
  function renderSectionsToPlainText(sections) {
    if (!Array.isArray(sections)) return '';
    return sections.map(s => {
      if (s.type === 'h2' || s.type === 'h3') return s.text;
      if (s.type === 'p') return (s.text || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      if (s.type === 'list') return (s.items || []).map(it => '- ' + it.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')).join('\n');
      if (s.type === 'table') {
        const hdr = (s.headers || []).join(' | ');
        const rows = (s.rows || []).map(r => r.join(' | ')).join('\n');
        return hdr + '\n' + rows;
      }
      return '';
    }).filter(Boolean).join('\n\n');
  }
  function renderFaqHTML(faq) {
    if (!Array.isArray(faq) || faq.length === 0) return '';
    const items = faq.map((qa, i) => `
      <div class="article-faq-item">
        <h3 class="faq-q-text">${escapeHtml(qa.q)}</h3>
        <p class="faq-a">${parseInlineMarkdown(qa.a)}</p>
      </div>
    `).join('');
    return `<section class="article-faq-section" id="faq-prerendered"><h2>Preguntas frecuentes</h2>${items}</section>`;
  }
  function renderSourcesHTML(sources) {
    if (!Array.isArray(sources) || sources.length === 0) return '';
    const items = sources.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}</a></li>`).join('');
    return `<section class="article-sources-section"><h2>Fuentes citadas</h2><ol class="article-sources">${items}</ol></section>`;
  }

  // 4. Pre-render artículos del blog en /recursos/<slug>.html
  console.log('\n📰 Prerendering blog articles (con body HTML completo)...');
  const recursosDir = path.join(root, 'recursos');
  fs.mkdirSync(recursosDir, { recursive: true });

  let articleCount = 0;
  for (const article of ARTICLES) {
    const articleRoute = `/recursos/${article.slug}`;

    // Construir noscript content desde sections del artículo
    const articleNoscript = `${article.tldr}\n\nEste artículo cubre: ${article.sections.filter(s => s.type === 'h2').map(s => s.text).join(' · ')}. Lectura completa de ${article.readingTime}. Por ${article.author}, ${article.authorRole}.`;

    const articleMeta = {
      title: `${article.title} | Recursos Intothecom`,
      description: article.description,
      noscript: articleNoscript,
      ogImage: `/assets/og/${article.slug}.jpg`,
      breadcrumb: [
        {name: 'Inicio', path: '/'},
        {name: 'Recursos', path: '/recursos'},
        {name: article.title, path: articleRoute}
      ]
    };

    const articleHtml = prerenderRoute(masterHtml, articleRoute, articleMeta);

    // Body real del artículo: HTML estático completo + texto plano para articleBody schema
    const articleBodyPlain = renderSectionsToPlainText(article.sections);
    const articleBodyHTML = renderSectionsToHTML(article.sections);
    const faqHTML = renderFaqHTML(article.faq);
    const sourcesHTML = renderSourcesHTML(article.sources);

    // Inyectar también el BlogPosting + FAQPage schema en el HTML pre-rendered
    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `https://www.intothecom.com${articleRoute}#article`,
      "headline": article.title,
      "description": article.description,
      "image": [`https://www.intothecom.com${article.heroImage || '/assets/og-cover.jpg'}`],
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt,
      "inLanguage": "es-CL",
      "wordCount": article.wordCount,
      "keywords": [article.keyword, ...(article.secondaryKeywords || [])].join(', '),
      "articleSection": article.category,
      // articleBody con texto plano completo — LLMs lo extraen directo del JSON-LD sin parsear HTML
      "articleBody": articleBodyPlain,
      "author": {
        "@type": "Person",
        "@id": "https://www.intothecom.com/equipo/ignacio-blanco#person",
        "name": article.author,
        "jobTitle": article.authorRole,
        "worksFor": {"@id": "https://www.intothecom.com/#org"}
      },
      "publisher": {"@id": "https://www.intothecom.com/#org"},
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.intothecom.com${articleRoute}`
      }
    };

    // OG meta para artículos: og:type=article + article:* tags (FB/LinkedIn previews + AI bots)
    const ogImageAlt = `${article.title} — recurso de Intothecom`;
    const articleOgMeta = `
<meta property="og:type" content="article"/>
<meta property="article:published_time" content="${article.publishedAt}T00:00:00Z"/>
<meta property="article:modified_time" content="${article.updatedAt}T00:00:00Z"/>
<meta property="article:author" content="https://www.intothecom.com/equipo/ignacio-blanco#person"/>
<meta property="article:section" content="${article.category}"/>
${(article.tags || []).map(t => `<meta property="article:tag" content="${t}"/>`).join('\n')}
<meta property="og:image:alt" content="${ogImageAlt}"/>
`;

    const faqSchema = article.faq && article.faq.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `https://www.intothecom.com${articleRoute}#faq`,
      "mainEntity": article.faq.map(qa => ({
        "@type": "Question",
        "name": qa.q,
        "acceptedAnswer": {"@type": "Answer", "text": qa.a}
      }))
    } : null;

    // Schemas extra por tipo de artículo
    const extraSchemas = [];

    // ItemList para ranking pages
    if (article.slug.startsWith('ranking-')) {
      const h3Items = article.sections.filter(s => s.type === 'h3' && /^\d+\./.test(s.text || ''));
      if (h3Items.length > 0) {
        extraSchemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `https://www.intothecom.com${articleRoute}#itemlist`,
          "itemListOrder": "https://schema.org/ItemListOrderAscending",
          "numberOfItems": h3Items.length,
          "itemListElement": h3Items.map((s, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": s.text.replace(/^\d+\.\s*/, '')
          }))
        });
      }
    }

    // HowTo para artículos con structure "5 pasos" o "guía completa"
    if (/guia-completa|kick-off-proyecto/.test(article.slug)) {
      const stepH2s = article.sections.filter(s => s.type === 'h2');
      if (stepH2s.length >= 3) {
        extraSchemas.push({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "@id": `https://www.intothecom.com${articleRoute}#howto`,
          "name": article.title,
          "description": article.description,
          "totalTime": "PT2H",
          "step": stepH2s.slice(0, 8).map((s, i) => ({
            "@type": "HowToStep",
            "position": i + 1,
            "name": s.text,
            "url": `https://www.intothecom.com${articleRoute}#${s.id || ''}`
          }))
        });
      }
    }

    const allSchemas = [blogPostingSchema, faqSchema, ...extraSchemas].filter(Boolean);
    const articleSchemas = '\n' + allSchemas.map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join('\n') + '\n';

    // Reemplazar og:type=website por og:type=article + inyectar article:* meta + alt específico
    let finalHtml = articleHtml.replace(
      /<meta property="og:type" content="website"\/?>/,
      ''
    );
    finalHtml = finalHtml.replace(
      /<meta property="og:image:alt" content="[^"]*"\/?>/,
      ''
    );
    finalHtml = finalHtml.replace('</head>', `${articleOgMeta}${articleSchemas}</head>`);

    // CRÍTICO: inyectar BODY HTML completo antes de </body> dentro de un <article hidden> para
    // que crawlers AI bots (sin JS) lean todo el contenido. React lo oculta visualmente al
    // montarse (style display:none → React render the proper UI). Los bots SÍ lo leen.
    const ssrBody = `
<article class="article-ssr-body" id="article-ssr" itemscope itemtype="https://schema.org/BlogPosting" style="position:absolute;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;">
  <nav aria-label="Breadcrumb" class="article-breadcrumb">
    <a href="/">Inicio</a> · <a href="/recursos">Recursos</a> · <span aria-current="page">${escapeHtml(article.title)}</span>
  </nav>
  <h1 class="article-h1" itemprop="headline">${escapeHtml(article.title)}</h1>
  <p class="article-tldr" itemprop="abstract"><strong>TL;DR.</strong> ${escapeHtml(article.tldr || '')}</p>
  <div class="article-meta">
    <span itemprop="author" itemscope itemtype="https://schema.org/Person">
      <strong itemprop="name">${escapeHtml(article.author || 'Ignacio Blanco')}</strong> · <span itemprop="jobTitle">${escapeHtml(article.authorRole || '')}</span>
    </span>
    · Publicado <time itemprop="datePublished" datetime="${article.publishedAt}">${article.publishedAt}</time>
    ${article.updatedAt !== article.publishedAt ? `· Actualizado <time itemprop="dateModified" datetime="${article.updatedAt}">${article.updatedAt}</time>` : ''}
    · ${escapeHtml(article.readingTime || '')} de lectura
  </div>
  <div class="article-prose" itemprop="articleBody">
${articleBodyHTML}
  </div>
${faqHTML}
${sourcesHTML}
</article>`;

    finalHtml = finalHtml.replace('</body>', `${ssrBody}\n</body>`);

    const outPath = path.join(recursosDir, `${article.slug}.html`);
    fs.writeFileSync(outPath, finalHtml, 'utf-8');
    console.log(`   ✓ recursos/${article.slug}.html (${articleBodyPlain.length} chars body)`);
    articleCount++;
  }

  console.log(`\n✅ Done! Generated ${count + 1} page HTMLs + ${articleCount} article HTMLs.`);
  console.log('   Beneficio: AI bots (ChatGPT-User, PerplexityBot, Claude-Web) ahora pueden leer cada URL.');
  console.log('   Cada artículo incluye BlogPosting + FAQPage + Speakable schema embedded.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
