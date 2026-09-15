#!/usr/bin/env node
/**
 * Give every Practice Assignment longer than one sitting a "Plan it as N sessions"
 * box, built from the assignment's own hidden checks.
 *
 *   node scripts/add-session-plans.mjs            # report
 *   node scripts/add-session-plans.mjs --write    # insert / refresh the boxes
 *
 * The checks in each catalog entry are already in build order — first the shape,
 * then behaviour, then edge cases — so slicing them into consecutive groups gives
 * each session a concrete target: "these checks pass". The box is idempotent:
 * an existing one (marked by its title) is replaced.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const SESSION_MINUTES = 45;
const TITLE = 'Plan it as sessions';

const catalogs = ['fscFoundations', 'fscObjects', 'fscCollections'];
const exercises = new Map();
for (const name of catalogs) {
  const mod = await import(pathToFileURL(path.join(ROOT, `src/lib/java-playground/catalog/${name}.ts`)).href);
  for (const list of Object.values(mod)) {
    if (!Array.isArray(list)) continue;
    for (const ex of list) exercises.set(ex.id, ex);
  }
}

function minutesOf(duration) {
  const nums = (duration.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return 0;
  const top = nums[nums.length - 1];
  return /hour/.test(duration) ? top * 60 : top;
}

function escapeAttr(text) {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildBox(ex, sessions) {
  const checks = ex.tests.map((t) => t.name);
  const per = Math.ceil(checks.length / sessions);
  const items = [];
  for (let i = 0; i < sessions; i += 1) {
    const slice = checks.slice(i * per, (i + 1) * per);
    if (slice.length === 0) break;
    const goal = slice.map((c) => `<em>${escapeAttr(c)}</em>`).join(', ');
    const lead =
      i === 0
        ? 'Get the file compiling with every method stubbed, then make these pass:'
        : i === sessions - 1
          ? 'Finish the edge cases and the rubric items nothing checks:'
          : 'Build on what already passes:';
    items.push(`  "<strong>Session ${i + 1}.</strong> ${lead} ${goal}."`);
  }
  return [
    `<RulesBox title="${TITLE}" items={[`,
    items.join(',\n'),
    ']} />',
  ].join('\n');
}

const dir = path.join(ROOT, 'src/content/assignments');
let changed = 0;
for (const track of fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory())) {
  for (const file of fs.readdirSync(path.join(dir, track)).filter((f) => f.endsWith('.mdx'))) {
    const p = path.join(dir, track, file);
    const raw = fs.readFileSync(p, 'utf8');
    const nl = raw.includes('\r\n') ? '\r\n' : '\n';
    const text = raw.replace(/\r\n/g, '\n');
    const duration = text.match(/^duration:\s*"?([^"\n]+)"?/m)?.[1] ?? '';
    const minutes = minutesOf(duration);
    const id = text.match(/<JavaPlayground id="([^"]+)"/)?.[1];
    const ex = id && exercises.get(id);
    const sessions = Math.ceil(minutes / SESSION_MINUTES);
    const want = ex && sessions >= 2 && ex.tests.length >= sessions;
    const existing = new RegExp(`\\n<RulesBox title="${TITLE}"[\\s\\S]*?\\]\\} />\\n`);
    let next = text.replace(existing, '\n');
    if (want) {
      const box = buildBox(ex, sessions);
      // Right before the playground, after "How the browser version differs".
      next = next.replace(/\n<JavaPlayground /, `\n${box}\n\n<JavaPlayground `);
    }
    const status = want ? `${sessions} sessions (${ex.tests.length} checks)` : minutes ? 'single sitting' : 'no playground';
    console.log(`${file.padEnd(34)} ${duration.padEnd(12)} ${status}`);
    if (WRITE && next !== text) {
      fs.writeFileSync(p, next.replace(/\n/g, nl), 'utf8');
      changed += 1;
    }
  }
}
console.log(WRITE ? `\n${changed} files updated` : '');
