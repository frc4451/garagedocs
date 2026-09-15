#!/usr/bin/env node
/**
 * Run every Practice Assignment's hidden tests against reference solutions, using
 * the same comparison the browser runner uses.
 *
 * This catches expected outputs that no correct program could produce — a broken
 * check is worse than no check, because the student assumes the fault is theirs.
 *
 * Solutions are compiled twice:
 *
 *   - **Java 25**, the curriculum standard and what a student uses locally;
 *   - the browser runner's level (`RUNTIME_SOURCE_LEVEL`, currently Java 17),
 *     so an assignment cannot quietly depend on syntax CheerpJ rejects.
 *
 * Reference solutions are answers, so they are NOT in this repository. Put them
 * in `scripts/java/solutions/` (gitignored), one file per `entryClass` —
 * `HelloTeam.java`, `BatterySanity.java`, and so on — or point `JP_SOLUTIONS` at
 * a directory elsewhere.
 *
 *   npm run verify:assignments
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const solutionsDir = process.env.JP_SOLUTIONS
  ? path.resolve(process.env.JP_SOLUTIONS)
  : path.join(root, 'scripts/java/solutions');

/** Mirrors normalizeOutput in src/lib/java-playground/compareOutput.ts. */
function normalizeOutput(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(solutionsDir)) {
  fail(
    `No reference solutions at ${path.relative(root, solutionsDir)}.\n` +
      'Add one .java file per assignment entry class, or set JP_SOLUTIONS to where they live.',
  );
}

const { FSC_FOUNDATIONS } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/catalog/fscFoundations.ts')).href
);
const { FSC_OBJECTS } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/catalog/fscObjects.ts')).href
);
const { FSC_COLLECTIONS } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/catalog/fscCollections.ts')).href
);

/** Every Practice Assignment that ships a playground. */
const ASSIGNMENTS = [...FSC_FOUNDATIONS, ...FSC_OBJECTS, ...FSC_COLLECTIONS];
const { RUNTIME_SOURCE_LEVEL } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/constants.ts')).href
);

/** '-1.8' is ECJ's spelling; javac wants a bare release number. */
const runtimeRelease = RUNTIME_SOURCE_LEVEL.replace(/^-/, '').replace(/^1\./, '');

const sources = ASSIGNMENTS.map((exercise) => {
  const file = path.join(solutionsDir, `${exercise.entryClass ?? 'Main'}.java`);
  if (!fs.existsSync(file)) fail(`Missing reference solution: ${path.relative(root, file)}`);
  return file;
});

/**
 * One output directory per exercise. The playground compiles a single file at a
 * time, and several assignments legitimately define the same helper class — A11,
 * A13 and A14 each carry their own `Robot` — so a shared directory would collide.
 */
function compile(release) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `jp-verify-${release}-`));
  const args = release === 'latest' ? [] : ['--release', release];
  const dirs = new Map();
  for (const source of sources) {
    const entry = path.basename(source, '.java');
    const out = path.join(root, entry);
    fs.mkdirSync(out, { recursive: true });
    execFileSync('javac', [...args, '-nowarn', '-d', out, source], { stdio: 'pipe' });
    dirs.set(entry, out);
  }
  return { root, dirs };
}

let failures = 0;

for (const release of ['latest', runtimeRelease]) {
  const label = release === 'latest' ? 'Java 25 (curriculum standard)' : `Java ${release} (browser runner)`;
  let compiled;
  try {
    compiled = compile(release);
  } catch (err) {
    failures += 1;
    console.log(`\n${label}\n  COMPILE FAILED\n${err.stderr?.toString().split('\n').slice(0, 8).map((l) => '    ' + l).join('\n')}`);
    continue;
  }

  console.log(`\n${label}`);
  for (const exercise of ASSIGNMENTS) {
    for (const test of exercise.tests) {
      let stdout = '';
      let stderr = '';
      try {
        const entry = exercise.entryClass ?? 'Main';
        stdout = execFileSync('java', ['-cp', compiled.dirs.get(entry), entry], {
          input: test.stdin ?? '',
          encoding: 'utf8',
          timeout: 20000,
          stdio: ['pipe', 'pipe', 'pipe'],
        });
      } catch (err) {
        stderr = err.stderr?.toString().split('\n')[0] ?? String(err);
        stdout = err.stdout?.toString() ?? '';
      }

      const passed =
        !stderr &&
        (test.pattern !== undefined
          ? new RegExp(test.pattern).test(normalizeOutput(stdout))
          : normalizeOutput(stdout) === normalizeOutput(test.stdout ?? ''));

      if (passed) {
        console.log(`  pass  ${exercise.id} / ${test.name}`);
      } else {
        failures += 1;
        console.log(`  FAIL  ${exercise.id} / ${test.name}`);
        if (stderr) console.log(`        ${stderr}`);
        console.log(`        wanted: ${test.pattern ? `/${test.pattern}/` : 'exact stdout'}`);
        console.log(
          normalizeOutput(stdout)
            .split('\n')
            .slice(0, 12)
            .map((l) => `        got:    ${l}`)
            .join('\n'),
        );
      }
    }
  }

  fs.rmSync(compiled.root, { recursive: true, force: true });
}

console.log(
  failures === 0
    ? '\nEvery check is satisfiable at both Java levels.'
    : `\n${failures} check(s) failed. A check no correct program can pass is a bug in the assignment.`,
);
process.exit(failures === 0 ? 0 : 1);
