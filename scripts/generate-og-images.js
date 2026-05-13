#!/usr/bin/env node
/**
 * generate-og-images.js — Genera OG images (1200×630) para el sitio + por artículo.
 *
 * Stack: sharp (ya en devDependencies) + SVG composite.
 *
 * Outputs:
 *   - assets/og-cover.jpg           (homepage / fallback default)
 *   - assets/og/<slug>.jpg          (por servicio + por artículo)
 *
 * Estilo: paleta dark IntoTheCom (#0a0a0b, #f4efe6, #f39200)
 *
 * Run: node scripts/generate-og-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'og');
fs.mkdirSync(OUT_DIR, { recursive: true });

const WIDTH = 1200;
const HEIGHT = 630;

// Colors (paleta IntoTheCom)
const COLOR_BG = '#0a0a0b';
const COLOR_BG_2 = '#1a1a1d';
const COLOR_INK = '#f4efe6';
const COLOR_ORANGE = '#f39200';
const COLOR_GRAY = '#8a8a8d';

function escapeXML(str) {
  return String(str).replace(/[<>&'"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;' })[c]);
}

function buildSVG({ eyebrow, title, subtitle, accent = 'default' }) {
  // Wrap title text si es muy largo (máx ~40 chars/línea)
  const maxCharsPerLine = 38;
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxCharsPerLine && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = (currentLine + ' ' + word).trim();
    }
    if (lines.length >= 3) break; // max 3 lines visible
  }
  if (currentLine && lines.length < 4) lines.push(currentLine);

  const titleY = HEIGHT / 2 - 20 - (lines.length - 1) * 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLOR_BG}"/>
      <stop offset="100%" stop-color="${COLOR_BG_2}"/>
    </linearGradient>
    <radialGradient id="orange-glow" cx="85%" cy="20%" r="50%">
      <stop offset="0%" stop-color="${COLOR_ORANGE}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${COLOR_ORANGE}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${COLOR_ORANGE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orange-glow-2" cx="15%" cy="85%" r="40%">
      <stop offset="0%" stop-color="${COLOR_ORANGE}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${COLOR_ORANGE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-grad)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#orange-glow)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#orange-glow-2)"/>

  <!-- Grain (sutil) -->
  <g opacity="0.05">
    ${Array.from({length: 80}, () => {
      const x = Math.floor(Math.random() * WIDTH);
      const y = Math.floor(Math.random() * HEIGHT);
      return `<rect x="${x}" y="${y}" width="1" height="1" fill="${COLOR_INK}"/>`;
    }).join('')}
  </g>

  <!-- Top eyebrow + decorative dot -->
  <g transform="translate(80, 80)">
    <circle cx="6" cy="6" r="6" fill="${COLOR_ORANGE}"/>
    <text x="24" y="11" font-family="JetBrains Mono, ui-monospace, monospace" font-size="14" fill="${COLOR_INK}" opacity="0.85" letter-spacing="2.5">
      ${escapeXML(eyebrow.toUpperCase())}
    </text>
  </g>

  <!-- Title (3 líneas max) -->
  ${lines.map((line, i) => `
    <text x="80" y="${titleY + i * 68}" font-family="Sora, system-ui, sans-serif" font-size="56" font-weight="500" fill="${COLOR_INK}" letter-spacing="-1">
      ${escapeXML(line)}
    </text>
  `).join('')}

  <!-- Subtitle -->
  ${subtitle ? `
    <text x="80" y="${titleY + lines.length * 68 + 32}" font-family="Sora, system-ui, sans-serif" font-size="22" fill="${COLOR_INK}" opacity="0.65" letter-spacing="0">
      ${escapeXML(subtitle)}
    </text>
  ` : ''}

  <!-- Bottom row: brand + URL -->
  <g transform="translate(80, ${HEIGHT - 80})">
    <text x="0" y="0" font-family="Sora, system-ui, sans-serif" font-size="24" font-weight="500" fill="${COLOR_INK}">
      Intothecom
    </text>
    <text x="135" y="0" font-family="JetBrains Mono, ui-monospace, monospace" font-size="14" fill="${COLOR_GRAY}" letter-spacing="2">
      · MARKETING, SOFTWARE &amp; IA
    </text>
  </g>

  <!-- Bottom right: URL -->
  <text x="${WIDTH - 80}" y="${HEIGHT - 80}" text-anchor="end" font-family="JetBrains Mono, ui-monospace, monospace" font-size="14" fill="${COLOR_ORANGE}" letter-spacing="2">
    INTOTHECOM.COM ↗
  </text>

  <!-- Orange accent line bottom -->
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="${COLOR_ORANGE}"/>
</svg>`;
}

async function generate(filename, options) {
  const svg = buildSVG(options);
  const svgBuffer = Buffer.from(svg);
  const outPath = path.join(filename.startsWith('/') ? filename : path.join(ROOT, filename));

  await sharp(svgBuffer)
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(outPath);

  const stats = fs.statSync(outPath);
  console.log(`   ✓ ${path.relative(ROOT, outPath)} (${(stats.size / 1024).toFixed(1)}KB)`);
}

async function run() {
  console.log('🎨 Generating OG images (1200×630)...');
  console.log('');

  // === 1. OG cover principal (homepage / fallback) ===
  await generate('assets/og-cover.jpg', {
    eyebrow: 'Estudio digital · est. 2019',
    title: 'Marketing, software & inteligencia.',
    subtitle: '+100 negocios asesorados · CL · BR · US · ES'
  });

  // === 2. Por página de servicio ===
  const SERVICES = [
    {
      slug: 'software-ia',
      eyebrow: 'Software & IA · servicio 01',
      title: 'Agentes IA y software a medida.',
      subtitle: 'Idea a producción en 6 semanas'
    },
    {
      slug: 'paid-media',
      eyebrow: 'Paid Media · servicio 02',
      title: 'Anuncios que venden, no que aparecen.',
      subtitle: 'Google · Meta · TikTok · LinkedIn'
    },
    {
      slug: 'email-marketing',
      eyebrow: 'Email Marketing · servicio 03',
      title: 'El canal más rentable, automatizado.',
      subtitle: 'Klaviyo · HubSpot · 4-6× ROI vs social'
    },
    {
      slug: 'desarrollo-web',
      eyebrow: 'Desarrollo Web · servicio 04',
      title: 'Sitios y e-commerce que convierten.',
      subtitle: 'Next.js · Shopify Headless · Lighthouse 90+'
    },
    {
      slug: 'community-management',
      eyebrow: 'Community · servicio 05',
      title: 'Comunidad real, no vanity metrics.',
      subtitle: 'Instagram · TikTok · LinkedIn · contenido editorial'
    }
  ];

  for (const svc of SERVICES) {
    await generate(`assets/og/${svc.slug}.jpg`, svc);
  }

  // === 3. Por artículo del blog ===
  let articles = [];
  try {
    const articlesModule = require(path.join(ROOT, 'data', 'articles.js'));
    articles = articlesModule.ARTICLES || [];
  } catch (e) {
    console.warn('   ⚠️  No se pudo cargar data/articles.js');
  }

  for (const article of articles) {
    await generate(`assets/og/${article.slug}.jpg`, {
      eyebrow: `Recursos · ${article.category}`,
      title: article.title,
      subtitle: `${article.readingTime} · por ${article.author}`
    });
  }

  console.log('');
  console.log(`✅ Done! Generated ${1 + SERVICES.length + articles.length} OG images.`);
  console.log('');
  console.log('Cómo usar:');
  console.log('  - Página default: <meta property="og:image" content="https://intothecom.com/assets/og-cover.jpg"/>');
  console.log('  - Servicio:       <meta property="og:image" content="https://intothecom.com/assets/og/<slug>.jpg"/>');
  console.log('  - Artículo:       <meta property="og:image" content="https://intothecom.com/assets/og/<article-slug>.jpg"/>');
  console.log('');
  console.log('Para re-generar después de cambios de copy o branding: node scripts/generate-og-images.js');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
