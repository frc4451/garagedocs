import assert from 'node:assert/strict';
import test from 'node:test';
import { MERMAID_THEMES, rehypeMermaid } from './rehype-mermaid.mjs';

const DIAGRAM = [
  'stateDiagram-v2',
  '  accTitle: Two states',
  '  accDescr: A moves to B.',
  '  A --> B',
].join('\n');

const fence = (code, line = 3) => ({
  type: 'element',
  tagName: 'pre',
  position: { start: { line } },
  children: [{
    type: 'element',
    tagName: 'code',
    properties: { className: ['language-mermaid'] },
    children: [{ type: 'text', value: code }],
  }],
});

const file = { cwd: '/site', path: '/site/src/content/frc/page.mdx' };

/** Stands in for Chromium: records each call and returns a fixed SVG. */
function fakeRenderer({ reject = false, mutate = false } = {}) {
  const calls = [];
  const render = async (diagrams, options) => {
    calls.push({ diagrams, options: structuredClone(options) });
    if (mutate) options.mermaidConfig.theme = 'dark';
    return diagrams.map(() => reject
      ? { status: 'rejected', reason: new Error('Parse error on line 2') }
      : { status: 'fulfilled', value: { svg: '<svg/>', width: 100.4, height: 50, title: 'Two states', description: 'A moves to B.' } });
  };
  return { render, calls };
}

test('replaces a fence with light and dark images that share one description', async () => {
  const { render, calls } = fakeRenderer();
  const tree = { type: 'root', children: [fence(DIAGRAM)] };
  await rehypeMermaid({ renderer: render })(tree, file);

  const figure = tree.children[0];
  assert.equal(figure.tagName, 'figure');
  const [light, dark, description] = figure.children;
  assert.deepEqual(light.properties.className, ['mermaid-diagram__light']);
  assert.deepEqual(dark.properties.className, ['mermaid-diagram__dark']);
  for (const img of [light, dark]) {
    assert.equal(img.properties.alt, 'Two states');
    assert.equal(img.properties.width, 101);
    assert.equal(img.properties.style, '--diagram-width: 101px');
    assert.equal(img.properties.ariaDescribedBy, description.properties.id);
    assert.match(img.properties.src, /^data:image\/svg\+xml;base64,/);
  }
  assert.deepEqual(description.properties.className, ['visually-hidden']);
  assert.equal(description.children[0].value, 'A moves to B.');

  assert.deepEqual(calls.map((call) => call.options.mermaidConfig.themeVariables), [MERMAID_THEMES.light, MERMAID_THEMES.dark]);
  assert.ok(calls.every((call) => call.options.mermaidConfig.theme === 'base'));
});

test('gives every render a fresh config, so a renderer that edits one cannot leak it', async () => {
  const { render, calls } = fakeRenderer({ mutate: true });
  for (let page = 0; page < 2; page++) {
    await rehypeMermaid({ renderer: render })({ type: 'root', children: [fence(DIAGRAM)] }, file);
  }
  assert.equal(calls.length, 4);
  assert.ok(calls.every((call) => call.options.mermaidConfig.theme === 'base'));
  assert.deepEqual(calls[2].options.mermaidConfig.themeVariables, MERMAID_THEMES.light);
});

test('gives repeated diagrams on one page distinct description ids', async () => {
  const { render } = fakeRenderer();
  const tree = { type: 'root', children: [fence(DIAGRAM), fence(DIAGRAM, 9)] };
  await rehypeMermaid({ renderer: render })(tree, file);
  const ids = tree.children.map((figure) => figure.children[2].properties.id);
  assert.notEqual(ids[0], ids[1]);
});

test('leaves other code blocks alone and skips rendering when a page has no diagram', async () => {
  const { render, calls } = fakeRenderer();
  const java = fence('int x = 1;');
  java.children[0].properties.className = ['language-java'];
  const tree = { type: 'root', children: [java] };
  const original = structuredClone(tree);
  await rehypeMermaid({ renderer: render })(tree, file);
  assert.deepEqual(tree, original);
  assert.equal(calls.length, 0);
});

for (const [name, code, message] of [
  ['accTitle', DIAGRAM.replace(/\n {2}accTitle.*/, ''), /accTitle/],
  ['accDescr', DIAGRAM.replace(/\n {2}accDescr.*/, ''), /accDescr/],
  ['click', `${DIAGRAM}\n  click A "https://example.com"`, /click/],
]) {
  test(`fails the build with the fence location when ${name === 'click' ? 'a click directive is present' : `${name} is missing`}`, async () => {
    const { render, calls } = fakeRenderer();
    await assert.rejects(
      rehypeMermaid({ renderer: render })({ type: 'root', children: [fence(code, 12)] }, file),
      (error) => message.test(error.message) && error.message.includes('src/content/frc/page.mdx:12'),
    );
    assert.equal(calls.length, 0);
  });
}

test('fails the build with the fence location when Mermaid cannot render', async () => {
  const { render } = fakeRenderer({ reject: true });
  await assert.rejects(
    rehypeMermaid({ renderer: render })({ type: 'root', children: [fence(DIAGRAM, 7)] }, file),
    /src\/content\/frc\/page\.mdx:7: Mermaid could not render this diagram: Parse error on line 2/,
  );
});

test('names the page and the install command when Chromium cannot start', async () => {
  const render = async () => {
    throw new Error("browserType.launch: Executable doesn't exist");
  };
  await assert.rejects(
    rehypeMermaid({ renderer: render })({ type: 'root', children: [fence(DIAGRAM, 5)] }, file),
    (error) =>
      error.message.includes("src/content/frc/page.mdx:5: Mermaid could not start Chromium: browserType.launch: Executable doesn't exist")
      && error.message.includes('npx playwright install chromium'),
  );
});
