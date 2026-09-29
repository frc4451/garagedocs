import assert from 'node:assert/strict';
import test from 'node:test';
import { rehypeBasePath } from './rehype-base-path.mjs';

for (const type of ['mdxJsxTextElement', 'mdxJsxFlowElement']) {
  test(`prefixes ${type} PDF downloads without changing the download attribute`, () => {
    const node = { type, name: 'a', attributes: [
      { type: 'mdxJsxAttribute', name: 'href', value: '/documents/badges/badge-2/test.pdf' },
      { type: 'mdxJsxAttribute', name: 'download', value: null },
    ] };
    const tree = { type: 'root', children: [node] };
    rehypeBasePath({ base: '/garagedocs' })(tree);
    assert.equal(node.attributes[0].value, '/garagedocs/documents/badges/badge-2/test.pdf');
    assert.equal(node.attributes[1].value, null);
    rehypeBasePath({ base: '/garagedocs' })(tree);
    assert.equal(node.attributes[0].value, '/garagedocs/documents/badges/badge-2/test.pdf');
  });
}

test('preserves root deployments, external URLs, expressions, and custom component props', () => {
  const make = (value, name = 'a') => ({ type: 'mdxJsxTextElement', name, attributes: [
    { type: 'mdxJsxAttribute', name: 'href', value },
  ] });
  const rootLink = make('/documents/test.pdf');
  rehypeBasePath({ base: '/' })(rootLink);
  assert.equal(rootLink.attributes[0].value, '/documents/test.pdf');
  const nodes = [make('https://example.com/test.pdf'), make('//example.com/test.pdf'),
    make('#downloads'), make({ type: 'mdxJsxAttributeValueExpression', value: 'pdfUrl' }),
    make('/documents/test.pdf', 'DownloadLink')];
  const original = structuredClone(nodes);
  rehypeBasePath({ base: '/garagedocs' })({ children: nodes });
  assert.deepEqual(nodes, original);
});

test('continues to prefix Markdown links and handles literal JSX srcSet', () => {
  const link = { tagName: 'a', properties: { href: '/documents/test.pdf' } };
  const image = { type: 'mdxJsxFlowElement', name: 'img', attributes: [
    { type: 'mdxJsxAttribute', name: 'srcSet', value: '/small.png 1x, /large.png 2x' },
  ] };
  rehypeBasePath({ base: '/garagedocs' })({ children: [link, image] });
  assert.equal(link.properties.href, '/garagedocs/documents/test.pdf');
  assert.equal(image.attributes[0].value, '/garagedocs/small.png 1x, /garagedocs/large.png 2x');
});
