import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lint, wrapProse } from './mdx-prose.mjs';

const long = 'The student checks the logged measurement and explains the expected result. '.repeat(4).trim();
test('flags prose at 101 characters, accepts 100', async () => {
  assert.equal((await lint('a'.repeat(100))).length, 0);
  assert.equal((await lint('a'.repeat(101))).length, 1);
});
test('wraps prose without changing code, attributes or frontmatter', async () => {
  const prefix = `---\ndescription: ${long}\n---\n\n<RulesBox title="${long}">\n\n`;
  const suffix = `\n\n</RulesBox>\n\n\`\`\`java\n// ${long}\n\`\`\`\n`;
  const result = wrapProse(prefix + long + suffix);
  assert.ok(result.startsWith(prefix));
  assert.ok(result.endsWith(suffix));
  assert.equal((await lint(result)).length, 0);
  assert.equal(wrapProse(result), result);
});
test('preserves nested list and blockquote structure', async () => {
  for (const prefix of ['- ', '1. ', '> ', '> - ', '  - ', '- [ ] ', '- [x] ']) {
    const result = wrapProse(prefix + long + '\n');
    assert.equal((await lint(result)).length, 0);
    assert.equal(wrapProse(result), result);
  }
});
test('keeps links and inline code intact and permits unbreakable links', async () => {
  const link = `[Cobra source file](https://example.com/${'path/'.repeat(30)})`;
  const input = long + ' ' + link + ' More words after the link.\n';
  const result = wrapProse(input);
  assert.ok(result.includes(link));
  assert.equal((await lint(result)).length, 0);
  const code = '`one two three four five six`';
  assert.ok(wrapProse(long + ' ' + code).includes(code));
});
test('preserves tables and ignores their width', async () => {
  const table = `| Name | Description |\n| --- | --- |\n| Test | ${long} |\n`;
  assert.equal(wrapProse(table), table);
  assert.equal((await lint(table)).length, 0);
});
test('preserves explicit hard line breaks', () => {
  const input = long + '  \nNext line.\n';
  assert.equal(wrapProse(input), input);
});
test('treats inline MDX markup as an indivisible span', async () => {
  assert.equal((await lint(`<Equation tex="${'x'.repeat(110)}" />.`)).length, 0);
  assert.equal((await lint(`<code>${'method.'.repeat(20)}</code>`)).length, 0);
});
