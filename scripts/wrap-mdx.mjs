import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { wrapProse } from './mdx-prose.mjs';

const files = [];
async function collect(path) {
  if (path.endsWith('.mdx')) { files.push(path); return; }
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.isDirectory() || entry.name.endsWith('.mdx')) await collect(join(path, entry.name));
  }
}
for (const path of process.argv.slice(2).length ? process.argv.slice(2) : ['src/content']) await collect(path);
let changed = 0;
let failed = 0;
for (const path of files.sort()) {
  try {
    const original = await readFile(path, 'utf8');
    const result = wrapProse(original);
    if (result !== original) { await writeFile(path, result); changed++; }
  } catch (error) { console.error(`${path}: ${error.message}`); failed++; }
}
console.log(`${files.length} MDX files checked; ${changed} wrapped; ${failed} failures.`);
if (failed) process.exitCode = 1;
