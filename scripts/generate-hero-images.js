#!/usr/bin/env node
/**
 * generate-hero-images.js — Hero images para artículos del blog.
 *
 * Dimensiones: 1600×900 (16:9, también sirve como og:image alternativo con crop).
 * Estilo: paleta dark IntoTheCom + accent orange + tipografía Sora.
 *
 * Outputs: assets/blog/<slug>.jpg
 * Run: node scripts/generate-hero-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'blog');
fs.mkdirSync(OUT_DIR, { recursive: true });

const WIDTH = 1600;
const HEIGHT = 900;

const COLOR_BG = '#0a0a0b';
const COLOR_BG_2 = '#121214';
const COLOR_INK = '#f4efe6';
const COLOR_ORANGE = '#f39200';
const COLOR_GRAY = '#8a8a8d';

function escapeXML(str) {
  return String(str).replace(/[<>&'"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', "'":'&apos;', '"':'&quot;' })[c]);
}

function buildHeroSVG({ category, title, subtitle, author, readingTime, accentSymbol }) {
  // Wrap title (max ~32 chars/line for hero size)
  const maxCharsPerLine = 32;
  const words = title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxCharsPerLine && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
    if (lines.length >= 3) break;
  }
  if (cur && lines.length < 4) lines.push(cur);

  const titleStartY = HEIGHT / 2 - 80 - (lines.length - 1) * 50;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLOR_BG}"/>
      <stop offset="100%" stop-color="${COLOR_BG_2}"/>
    </linearGradient>
    <radialGradient id="glow-tr" cx="80%" cy="10%" r="60%">
      <stop offset="0%" stop-color="${COLOR_ORANGE}" stop-opacity="0.22"/>
      <stop offset="40%" stop-color="${COLOR_ORANGE}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${COLOR_ORANGE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow-bl" cx="10%" cy="90%" r="50%">
      <stop offset="0%" stop-color="${COLOR_ORANGE}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${COLOR_ORANGE}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="${COLOR_INK}" stroke-width="1" opacity="0.025"/>
    </pattern>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow-tr)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow-bl)"/>

  <!-- Grain texture -->
  <g opacity="0.045">
    ${Array.from({length: 140}, () => {
      const x = Math.floor(Math.random() * WIDTH);
      const y = Math.floor(Math.random() * HEIGHT);
      return `<rect x="${x}" y="${y}" width="1" height="1" fill="${COLOR_INK}"/>`;
    }).join('')}
  </g>

  <!-- Top eyebrow line -->
  <g transform="translate(120, 100)">
    <circle cx="8" cy="8" r="8" fill="${COLOR_ORANGE}"/>
    <text x="32" y="14" font-family="JetBrains Mono, ui-monospace, monospace" font-size="16" fill="${COLOR_INK}" opacity="0.9" letter-spacing="3">
      RECURSOS · ${escapeXML(category.toUpperCase())}
    </text>
  </g>

  <!-- Decorative accent symbol top-right -->
  <g transform="translate(${WIDTH - 200}, 120)" opacity="0.4">
    <text font-family="Instrument Serif, serif" font-style="italic" font-size="120" fill="${COLOR_ORANGE}" text-anchor="end">
      ${escapeXML(accentSymbol || '*')}
    </text>
  </g>

  <!-- Title (hasta 3 líneas) -->
  ${lines.map((line, i) => `
    <text x="120" y="${titleStartY + i * 88}" font-family="Sora, system-ui, sans-serif" font-size="72" font-weight="500" fill="${COLOR_INK}" letter-spacing="-1.5">
      ${escapeXML(line)}
    </text>
  `).join('')}

  <!-- Subtitle -->
  ${subtitle ? `
    <text x="120" y="${titleStartY + lines.length * 88 + 40}" font-family="Sora, system-ui, sans-serif" font-size="28" fill="${COLOR_INK}" opacity="0.7" letter-spacing="0">
      ${escapeXML(subtitle)}
    </text>
  ` : ''}

  <!-- Bottom meta row: author + reading time + brand -->
  <g transform="translate(120, ${HEIGHT - 100})">
    <text x="0" y="0" font-family="JetBrains Mono, ui-monospace, monospace" font-size="14" fill="${COLOR_GRAY}" letter-spacing="2">
      POR ${escapeXML((author || 'INTOTHECOM').toUpperCase())} · ${escapeXML((readingTime || '').toUpperCase())}
    </text>
  </g>

  <!-- Bottom right: brand mark -->
  <g transform="translate(${WIDTH - 120}, ${HEIGHT - 100})">
    <text x="0" y="0" text-anchor="end" font-family="Sora, system-ui, sans-serif" font-size="22" font-weight="500" fill="${COLOR_INK}">
      Intothecom
    </text>
    <text x="0" y="22" text-anchor="end" font-family="JetBrains Mono, ui-monospace, monospace" font-size="11" fill="${COLOR_ORANGE}" letter-spacing="2">
      INTOTHECOM.COM ↗
    </text>
  </g>

  <!-- Orange accent bar -->
  <rect x="0" y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="${COLOR_ORANGE}"/>
</svg>`;
}

async function generateHero(slug, options) {
  const svg = buildHeroSVG(options);
  const out = path.join(OUT_DIR, `${slug}.jpg`);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(out);
  const stats = fs.statSync(out);
  console.log(`   ✓ ${path.relative(ROOT, out)} (${(stats.size / 1024).toFixed(1)}KB)`);
}

async function run() {
  console.log('🖼️  Generating hero images (1600×900) for blog articles...');
  console.log('');

  let articles = [];
  try {
    const m = require(path.join(ROOT, 'data', 'articles.js'));
    articles = m.ARTICLES || [];
  } catch (e) {
    console.error('Error cargando data/articles.js:', e.message);
    process.exit(1);
  }

  const accentSymbols = ['*', '&', '+', '§', '#', '@', '!'];

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    await generateHero(a.slug, {
      category: a.category,
      title: a.title,
      subtitle: a.description.substring(0, 110) + (a.description.length > 110 ? '…' : ''),
      author: a.author,
      readingTime: a.readingTime,
      accentSymbol: accentSymbols[i % accentSymbols.length]
    });
  }

  console.log('');
  console.log(`✅ Done! Generated ${articles.length} hero images.`);
  console.log('   Cada artículo referencia su hero via heroImage en data/articles.js');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
