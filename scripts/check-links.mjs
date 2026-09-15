/**
 * Site-wide internal link check over the built site.
 *
 * Walks every HTML file under dist/, collects every internal `href`/`src`
 * (site-root-relative or page-relative), and reports two kinds of failure:
 *   - MISSING: the path resolves to no file (or directory index) in dist/
 *   - NOFRAG:  the path exists but its `#fragment` names no element id on it
 *
 * Fragments matter because lesson cross-references are meant to point at the
 * section that teaches the claim (`/frc/io-layer#swapping-implementations`), and
 * a renamed heading silently breaks them. Run after `npm run build`:
 *
 *   npm run links
 *
 * Exits non-zero when anything is broken, so it can gate CI.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const BASE = '/mantik-garage';

const ATTR = /<(a|link|script|img)\b[^>]*?\s(?:href|src)="([^"]*)"/gi;
const ID = /\sid="([^"]+)"/g;

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
})(DIST);

const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(ID)].map((m) => m[1])));
  }
  return idCache.get(file);
}

function targetFile(href) {
  let p = href.split('#')[0].split('?')[0];
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  const full = path.join(DIST, p.replace(/^\/+/, ''));
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  const index = path.join(full, 'index.html');
  if (fs.existsSync(index)) return index;
  return null;
}

const missing = new Map();
const nofrag = new Map();
const note = (map, key, page) => map.set(key, [...(map.get(key) ?? []), page]);

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DIST, file);
  const ownIds = idsOf(file);
  for (const [, , href] of html.matchAll(ATTR)) {
    if (/^(https?:|mailto:|data:|javascript:)/i.test(href)) continue;
    if (href.startsWith('#')) {
      const frag = href.slice(1);
      if (frag && !ownIds.has(frag)) note(nofrag, href, rel);
      continue;
    }
    // Relative links (`../foo`, `bar/`) resolve against the page's own URL; the
    // site never authors these on purpose, so a survivor is a migration leftover.
    let resolved = href;
    if (!href.startsWith('/')) {
      const pageUrl = '/' + rel.split(path.sep).join('/').replace(/index\.html$/, '');
      resolved = new URL(href, 'http://x' + pageUrl).pathname + (href.includes('#') ? href.slice(href.indexOf('#')) : '');
    }
    const target = targetFile(resolved);
    if (!target) { note(missing, href, rel); continue; }
    const hash = resolved.indexOf('#');
    if (hash >= 0) {
      const frag = resolved.slice(hash + 1);
      if (frag && !idsOf(target).has(frag)) note(nofrag, href, rel);
    }
  }
}

console.log(`${pages.length} pages scanned, ${missing.size} missing targets, ${nofrag.size} bad fragments`);
const show = (label, map) => {
  for (const [href, from] of [...map].sort()) {
    const more = from.length > 1 ? ` (+${from.length - 1})` : '';
    console.log(`  ${label} ${href}  <- ${from[0]}${more}`);
  }
};
show('MISSING', missing);
show('NOFRAG ', nofrag);
process.exit(missing.size + nofrag.size ? 1 : 0);
