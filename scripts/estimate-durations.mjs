#!/usr/bin/env node
/**
 * Estimate a lesson's `duration` from its content, sized for one sitting.
 *
 *   node scripts/estimate-durations.mjs            # report only
 *   node scripts/estimate-durations.mjs --write    # update frontmatter
 *
 * The estimate is "read it and try the examples", not "do every exercise":
 *
 *   - prose at 140 words/min (technical reading with code in it)
 *   - 5 s per code line, capped at 25 min, for reading or typing along
 *   - +5 min per runnable playground, +5 per exercise box (the first exercise or two;
 *     the hidden answer keys are not counted as reading)
 *   - +1 min per code block for the context switch, capped at 10
 *
 * rounded to 5 minutes, floor 10. Practice Assignments keep the estimates from
 * the FSC curriculum they are adapted from (see docs/content-authoring.md);
 * pages that carry their own `durationFixed: true` are left alone.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// `tools` is deliberately absent: its pages are reference material and carry no duration.
const SECTIONS = ['java', 'frc', 'kit-bot'];
const WRITE = process.argv.includes('--write');
const ONLY = process.argv.find((a) => a.startsWith('--section='))?.slice('--section='.length);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function measure(body) {
  const fences = [...body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)];
  let codeLines = fences.reduce((n, m) => n + m[1].split('\n').filter((l) => l.trim()).length, 0);
  // Code inside CodeTabs props is JSON-escaped; count its newlines. ExerciseBox
  // `answers` are hidden solution keys, not reading, so they are not counted.
  for (const m of body.matchAll(/"code":"((?:[^"\\]|\\.)*)"/g)) codeLines += (m[1].match(/\\n/g) || []).length;
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[A-Z][A-Za-z]*[\s\S]*?(?:\/>|>)/g, ' ')
    .replace(/<\/[A-Z][A-Za-z]*>/g, ' ');
  const proseWords = (prose.match(/[A-Za-z0-9][\w'’-]*/g) || []).length;
  return {
    proseWords,
    codeLines,
    codeBlocks: fences.length + (body.match(/<CodeTabs/g) || []).length,
    playgrounds: (body.match(/<JavaPlayground/g) || []).length,
    exerciseBoxes: (body.match(/<ExerciseBox/g) || []).length,
  };
}

export function estimateMinutes(m) {
  let minutes = m.proseWords / 140;
  minutes += Math.min(m.codeLines * (5 / 60), 25);
  minutes += Math.min(m.codeBlocks, 10);
  minutes += m.playgrounds * 5;
  minutes += m.exerciseBoxes * 5;
  return Math.max(10, Math.round(minutes / 5) * 5);
}

let changed = 0;
const rows = [];
for (const section of SECTIONS) {
  if (ONLY && ONLY !== section) continue;
  for (const file of walk(path.join(ROOT, 'src/content', section))) {
    const raw = fs.readFileSync(file, 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    if (/^isOverview:\s*true/m.test(fm[1]) || /^durationFixed:\s*true/m.test(fm[1])) continue;
    const body = raw.slice(fm[0].length);
    const m = measure(body);
    const minutes = estimateMinutes(m);
    const current = fm[1].match(/^duration:\s*"?([^"\r\n]+)"?/m)?.[1]?.trim() ?? null;
    rows.push({ section, file: path.relative(ROOT, file), current, minutes, ...m });
    if (!WRITE) continue;
    const next = `duration: ${minutes} min`;
    let header = fm[1];
    header = /^duration:/m.test(header)
      ? header.replace(/^duration:.*$/m, next)
      : header.replace(/^(order:.*)$/m, `$1\n${next}`);
    if (header !== fm[1]) {
      fs.writeFileSync(file, raw.replace(fm[1], header), 'utf8');
      changed += 1;
    }
  }
}

for (const r of rows) {
  const flag = r.minutes > 45 ? '  <-- over 45' : '';
  console.log(
    `${r.section.padEnd(12)} ${String(r.current ?? '-').padStart(8)} -> ${String(r.minutes).padStart(3)} min  ` +
      `${String(r.proseWords).padStart(5)}w ${String(r.codeLines).padStart(4)}c  ${path.basename(r.file)}${flag}`,
  );
}
console.log(`\n${rows.length} lessons, ${rows.filter((r) => r.minutes > 45).length} over 45 min${WRITE ? `, ${changed} files updated` : ''}`);
