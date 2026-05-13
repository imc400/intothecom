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
    description: 'Estudio digital con +100 negocios asesorados. Paid media, email, web, community y agentes de IA a medida. Chile, Brasil, USA, España.',
    noscript: 'Intothecom es un estudio digital chileno fundado en 2019. Ofrece 5 servicios integrados: Software & IA a medida, Paid Media, Email Marketing, Diseño y Desarrollo Web, y Community Management. +100 negocios asesorados en Chile, Brasil, USA y España. Contacto: WhatsApp +56 9 7414 3642 · info@intothecom.com.',
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
    title: 'Community Management · Contenido editorial y comunidad real | Intothecom',
    description: 'Línea editorial documentada, producción mensual de foto y video, gestión de DMs y crisis. Comunidad que compra, no vanity metrics.',
    noscript: 'Community Management con Intothecom: línea editorial documentada, producción mensual de foto y video, gestión de DMs y crisis management. Instagram, TikTok y LinkedIn. Comunidad que compra, no vanity metrics. Reportes mensuales con métricas reales.',
    ogImage: '/assets/og/community-management.jpg',
    breadcrumb: [{name: 'Inicio', path: '/'}, {name: 'Servicios', path: '/servicios'}, {name: 'Community Management', path: '/community-management'}]
  },
  '/nosotros': {
    title: 'Nosotros · Estudio digital desde 2019 | Intothecom',
    description: '+5 años, +100 negocios y 4 mercados. Una agencia con obsesión por los datos: si no se puede medir, no lo hacemos. Equipo senior dedicado.',
    noscript: 'Nosotros · Intothecom es un estudio digital chileno fundado en 2019. +5 años de operación, +100 negocios asesorados, +5M USD generados vía RRSS para clientes, -50% CAC promedio. 5.0★ en Google con 17 reseñas. Mercados: Chile, Brasil, USA, España. Equipo senior in-house.',
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
    noscript: 'Contacto Intothecom: Almirante Pastene 333, oficina 402, Providencia, Santiago, Chile. WhatsApp +56 9 7414 3642. Email: info@intothecom.com / ignacio@intothecom.com. Horario: Lunes a Viernes 9:00-19:00 hora Santiago. Operamos en Chile, Brasil, USA y España.',
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
    description: 'Pillar pages, casos de estudio y benchmarks de marketing digital B2B, GEO, AEO, paid media, email automation y desarrollo web. Editados por consultores con +100 implementaciones reales.',
    noscript: 'Recursos Intothecom: blog con pillar pages y guías técnicas sobre marketing digital B2B en LATAM, Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), paid media B2B, email marketing automation con Klaviyo y HubSpot, desarrollo web headless con Next.js y Shopify, agentes IA empresariales, y community management estratégico. Editado por consultores con +100 implementaciones reales en Chile, Brasil, USA y España.',
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

const DOMAIN = 'https://intothecom.com';

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
  const articlesHash = contentHash(path.join(root, 'data', 'articles.js'));
  console.log('   shared.js:', hashes['shared.js']);
  console.log('   page-home.js:', hashes['page-home.js']);
  console.log('   pages.js:', hashes['pages.js']);
  console.log('   page-recursos.js:', hashes['page-recursos.js']);
  console.log('   app.js:', hashes['app.js']);
  console.log('   data/articles.js:', articlesHash);

  // 2. Prerender HTML per route
  console.log('\n📄 Prerendering per-route HTML files...');
  let masterHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');

  // Inyectar cache busting versions en los src
  masterHtml = masterHtml.replace(/src="\/data\/articles\.js(\?v=[a-f0-9]+)?"/, `src="/data/articles.js?v=${articlesHash}"`);
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

  // 4. Pre-render artículos del blog en /recursos/<slug>.html
  console.log('\n📰 Prerendering blog articles...');
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
        {name: article.title.substring(0, 50), path: articleRoute}
      ]
    };

    const articleHtml = prerenderRoute(masterHtml, articleRoute, articleMeta);

    // Inyectar también el BlogPosting + FAQPage schema en el HTML pre-rendered
    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `https://intothecom.com${articleRoute}#article`,
      "headline": article.title,
      "description": article.description,
      "image": [`https://intothecom.com${article.heroImage || '/assets/og-cover.jpg'}`],
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt,
      "inLanguage": "es-CL",
      "wordCount": article.wordCount,
      "keywords": [article.keyword, ...(article.secondaryKeywords || [])].join(', '),
      "articleSection": article.category,
      "author": {
        "@type": "Person",
        "name": article.author,
        "jobTitle": article.authorRole,
        "worksFor": {"@id": "https://intothecom.com/#org"}
      },
      "publisher": {"@id": "https://intothecom.com/#org"},
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://intothecom.com${articleRoute}`
      }
    };

    const faqSchema = article.faq && article.faq.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `https://intothecom.com${articleRoute}#faq`,
      "mainEntity": article.faq.map(qa => ({
        "@type": "Question",
        "name": qa.q,
        "acceptedAnswer": {"@type": "Answer", "text": qa.a}
      }))
    } : null;

    const articleSchemas = `\n<script type="application/ld+json">\n${JSON.stringify(blogPostingSchema, null, 2)}\n</script>\n${faqSchema ? `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>\n` : ''}`;

    const finalHtml = articleHtml.replace('</head>', `${articleSchemas}</head>`);

    const outPath = path.join(recursosDir, `${article.slug}.html`);
    fs.writeFileSync(outPath, finalHtml, 'utf-8');
    console.log(`   ✓ recursos/${article.slug}.html`);
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
