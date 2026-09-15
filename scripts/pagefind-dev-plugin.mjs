import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagefindDist = path.join(root, 'dist', 'pagefind');
const pagefindModules = path.join(root, 'node_modules', 'pagefind');

const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.pfindex': 'application/octet-stream',
  '.pagefind': 'application/octet-stream',
  '.wasm': 'application/wasm',
};

function resolvePagefindFile(urlPath) {
  const rel = urlPath.replace(/^.*\/pagefind\//, '').split('?')[0];
  if (!rel || rel.includes('..')) return null;

  const distFile = path.join(pagefindDist, rel);
  if (fs.existsSync(distFile) && fs.statSync(distFile).isFile()) return distFile;

  const moduleFile = path.join(pagefindModules, rel);
  if (fs.existsSync(moduleFile) && fs.statSync(moduleFile).isFile()) return moduleFile;

  return null;
}

/**
 * Serve Pagefind assets from dist/pagefind (or node_modules fallback) during astro dev.
 *
 * `base` mirrors the `base` in astro.config.mjs. Older Astro passed requests to Vite
 * middlewares with the base still attached (`/<base>/pagefind/...`); current Astro
 * strips it first (`/pagefind/...`). Match both so the index is served either way —
 * when only one matched, dev search failed silently because `pagefind-ui.js` 404'd.
 */
export function pagefindDevPlugin(base = '/') {
  return {
    name: 'pagefind-dev',
    configureServer(server) {
      const withBase = `${base.replace(/\/+$/, '')}/pagefind/`;
      const withoutBase = '/pagefind/';
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith(withBase) && !url.startsWith(withoutBase)) return next();

        const filePath = resolvePagefindFile(req.url);
        if (!filePath) {
          res.statusCode = 404;
          res.end('Pagefind asset not found');
          return;
        }

        const ext = path.extname(filePath);
        res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}
