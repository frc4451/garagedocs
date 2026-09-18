#!/usr/bin/env node
/**
 * Validate the public Practice assignment catalog without needing the private
 * mentor reference solutions. This is the assignment check that runs in CI.
 *
 * Mentors can run `npm run verify:assignments` locally to compile the private
 * solutions and prove that every hidden check is satisfiable at Java 25 and at
 * the browser runner's Java level.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { FSC_FOUNDATIONS } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/catalog/fscFoundations.ts')).href
);
const { FSC_OBJECTS } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/catalog/fscObjects.ts')).href
);
const { FSC_COLLECTIONS } = await import(
  pathToFileURL(path.join(root, 'src/lib/java-playground/catalog/fscCollections.ts')).href
);

const assignments = [...FSC_FOUNDATIONS, ...FSC_OBJECTS, ...FSC_COLLECTIONS];
const failures = [];
const seenIds = new Set();
const javaIdentifier = /^[A-Za-z_$][A-Za-z\d_$]*$/;

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    failures.push(`${label} must be a non-empty string.`);
  }
}

for (const assignment of assignments) {
  const label = assignment.id || '<missing id>';

  requireText(assignment.id, `${label}: id`);
  requireText(assignment.title, `${label}: title`);
  requireText(assignment.prompt, `${label}: prompt`);
  requireText(assignment.starter, `${label}: starter`);

  if (seenIds.has(assignment.id)) {
    failures.push(`${label}: duplicate assignment id.`);
  }
  seenIds.add(assignment.id);

  if (typeof assignment.showStdin !== 'boolean') {
    failures.push(`${label}: showStdin must be true or false.`);
  }

  const entryClass = assignment.entryClass ?? 'Main';
  if (!javaIdentifier.test(entryClass)) {
    failures.push(`${label}: entryClass ${JSON.stringify(entryClass)} is not a Java identifier.`);
  }

  const escapedEntryClass = entryClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`\\bpublic\\s+class\\s+${escapedEntryClass}\\b`).test(assignment.starter)) {
    failures.push(`${label}: starter must declare public class ${entryClass}.`);
  }

  if (!Array.isArray(assignment.tests) || assignment.tests.length === 0) {
    failures.push(`${label}: at least one hidden check is required.`);
    continue;
  }

  const seenTestNames = new Set();
  for (const [index, test] of assignment.tests.entries()) {
    const testLabel = `${label}: test ${index + 1}`;
    requireText(test.name, `${testLabel} name`);

    if (seenTestNames.has(test.name)) {
      failures.push(`${testLabel}: duplicate test name ${JSON.stringify(test.name)}.`);
    }
    seenTestNames.add(test.name);

    const hasStdout = typeof test.stdout === 'string';
    const hasPattern = typeof test.pattern === 'string';
    if (hasStdout === hasPattern) {
      failures.push(`${testLabel}: define exactly one of stdout or pattern.`);
    }

    if (hasPattern) {
      requireText(test.describe, `${testLabel} describe`);
      try {
        new RegExp(test.pattern);
      } catch (error) {
        failures.push(`${testLabel}: invalid pattern (${error.message}).`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Practice assignment catalog has ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

const testCount = assignments.reduce((total, assignment) => total + assignment.tests.length, 0);
console.log(`Practice assignment catalog is valid: ${assignments.length} assignments, ${testCount} checks.`);
