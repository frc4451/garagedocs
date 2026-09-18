// Checks the citation blocks (`<Sources>` in MDX, `src/components/blocks/Sources.astro`).
//
//   npm run sources            check every cited URL responds, list pages without a block
//   npm run sources -- --quiet only print failures
//
// Reads the MDX sources directly (not dist/), resolves registry ids through
// src/data/sources.ts, fetches each unique URL once with a browser-like User-Agent, and
// exits non-zero if any URL fails. Every lesson page in the required sections is expected
// to carry a block; section overviews are exempt.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src', 'content');
const REQUIRED_SECTIONS = ['frc', 'tools', 'kit-bot', 'assignments', 'java', 'badges'];
const quiet = process.argv.includes('--quiet');

// Pull the registry out of the TypeScript source without a TS loader: it is a plain
// object literal with string values.
const registrySource = readFileSync(join(ROOT, 'src', 'data', 'sources.ts'), 'utf8');
const registry = {};
for (const m of registrySource.matchAll(/^\s{2}'?([\w-]+)'?:\s*\{[^}]*?base:\s*'([^']+)'/gms)) {
  registry[m[1]] = m[2];
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const urls = new Map(); // url -> [pages]
const missing = [];
for (const file of walk(CONTENT)) {
  const rel = relative(CONTENT, file).replace(/\\/g, '/');
  const section = rel.split('/')[0];
  const text = readFileSync(file, 'utf8');
  const blocks = [...text.matchAll(/<Sources\s+items=\{(\[[\s\S]*?\])\}\s*\/>/g)];
  if (blocks.length === 0) {
    if (REQUIRED_SECTIONS.includes(section) && !rel.endsWith('overview.mdx')) missing.push(rel);
    continue;
  }
  for (const block of blocks) {
    let items;
    try {
      items = JSON.parse(block[1]);
    } catch (err) {
      console.error(`${rel}: Sources block is not valid JSON (${err.message})`);
      process.exitCode = 1;
      continue;
    }
    for (const item of items) {
      let url = item.url;
      if (item.source) {
        const base = registry[item.source];
        if (!base) {
          console.error(`${rel}: unknown source id "${item.source}"`);
          process.exitCode = 1;
          continue;
        }
        url = base + (item.path ?? '').replace(/^\//, '');
      }
      if (!url || !/^https?:/.test(url)) continue; // internal links are covered by `npm run links`
      if (!urls.has(url)) urls.set(url, []);
      urls.get(url).push(rel);
    }
  }
}

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([403, 408, 425, 429]);

function shouldRetry(status) {
  return (
    typeof status !== 'number' ||
    RETRYABLE_STATUS.has(status) ||
    (status >= 500 && status < 600)
  );
}

async function checkOnce(url) {
  const headers = { 'User-Agent': 'Mozilla/5.0 (garagedocs source check)' };
  try {
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status >= 400) {
      // Some hosts answer HEAD with an error and GET with the page (the VS Code marketplace does).
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    }
    return res.status;
  } catch (err) {
    return `ERR ${err.message}`;
  }
}

async function check(url) {
  let status;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    status = await checkOnce(url);
    if (!shouldRetry(status) || attempt === MAX_ATTEMPTS) return status;

    // A small stagger keeps a temporary host or rate limit from receiving every
    // retry at once. Permanent client errors such as 404 are never retried.
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
  }
  return status;
}

const failures = [];
const entries = [...urls.entries()];
// Keep enough parallelism for a full-site check without sending large bursts to
// GitHub, WPILib, Oracle, and the other documentation hosts.
const limit = 4;
let index = 0;
await Promise.all(
  Array.from({ length: limit }, async () => {
    while (index < entries.length) {
      const [url, pages] = entries[index++];
      const status = await check(url);
      const ok = typeof status === 'number' && status >= 200 && status < 400;
      if (!ok) failures.push({ url, status, pages });
      else if (!quiet) console.log(`${status}  ${url}`);
    }
  }),
);

console.log(`\n${urls.size} unique source URLs checked, ${failures.length} failing`);
for (const f of failures) {
  console.log(`  ${f.status}  ${f.url}  <- ${f.pages.join(', ')}`);
}
if (missing.length) {
  console.log(`\n${missing.length} ${REQUIRED_SECTIONS.join('/')} pages without a <Sources> block:`);
  for (const m of missing) console.log(`  ${m}`);
}
if (failures.length) process.exitCode = 1;
