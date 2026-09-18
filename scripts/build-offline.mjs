// Run after Pagefind: the offline snapshot must include its generated index.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const base = '/' + (process.env.BASE_PATH || '').trim().replace(/^\/+|\/+$/g, '');
const scope = base === '/' ? '/' : base + '/';
const manifest = {
  id: scope, name: 'GarageDocs', short_name: 'GarageDocs',
  description: 'Programming and robotics documentation from FRC 4451.',
  start_url: scope, scope, display: 'standalone',
  background_color: '#fffaf7', theme_color: '#fffaf7',
  icons: [192, 512].map(size => ({
    src: scope + 'media/pwa-' + size + '.png', sizes: size + 'x' + size, type: 'image/png', purpose: 'any',
  })),
};
await writeFile('dist/manifest.webmanifest', JSON.stringify(manifest));
const files = [];
async function walk(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) await walk(join(dir, entry.name), name + '/');
    else if (!['sw.js', 'offline-info.json', 'stats.html'].includes(name) && !name.endsWith('.map')) {
      const bytes = await readFile(join(dir, entry.name));
      files.push({ url: scope + name.split('/').map(encodeURIComponent).join('/'),
        size: bytes.length, hash: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await walk('dist');
files.sort((a, b) => a.url.localeCompare(b.url));
const source = await readFile('scripts/offline-worker.js', 'utf8');
const version = createHash('sha256').update(JSON.stringify(files)).update(source).digest('hex').slice(0, 20);
const info = { version, bytes: files.reduce((sum, file) => sum + file.size, 0), count: files.length };
await writeFile('dist/offline-info.json', JSON.stringify(info));
await writeFile('dist/sw.js', 'const BUILD = ' + JSON.stringify({ ...info, scope, files }) + ';\n' + source);
console.log('Offline snapshot: ' + info.count + ' files, ' + (info.bytes / 1048576).toFixed(1) + ' MiB (' + version + ')');
