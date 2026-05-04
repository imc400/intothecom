/* Pre-compile JSX with esbuild — drops Babel-in-browser runtime (~870KB).
   Run: `npm run build` (also runs automatically on Vercel via package.json). */

const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

const outdir = path.join(__dirname, 'dist');
fs.mkdirSync(outdir, { recursive: true });

const entries = [
  'components/shared.jsx',
  'components/page-home.jsx',
  'components/pages.jsx',
  'components/app.jsx',
];

build({
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
}).then(() => {
  console.log('\n✓ Build complete →', outdir);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
