import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { VFile } from 'vfile';
import proseLineLength from './remark-prose-line-length.mjs';

export const processor = unified().use(remarkParse).use(remarkMdx)
  .use(remarkFrontmatter, ['yaml', 'toml']).use(remarkGfm).use(proseLineLength, 100);

export async function lint(value, path = 'example.mdx') {
  const file = new VFile({ value, path });
  await processor.run(processor.parse(file), file);
  return file.messages;
}

// Ignore source positions and soft whitespace, but retain every structural node,
// code value, expression, attribute and link destination when comparing parses.
function canonical(node) {
  if (Array.isArray(node)) return node.map(canonical);
  if (!node || typeof node !== 'object') return node;
  return Object.fromEntries(Object.entries(node).filter(([key]) => !['position', 'data'].includes(key))
    .map(([key, value]) => [key, key === 'value' && node.type === 'text'
      ? value.replace(/\s+/gu, ' ') : canonical(value)]));
}

export function wrapProse(source, width = 100) {
  const tree = processor.parse(source);
  const edits = [];
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  function walk(node) {
    if (['table', 'code', 'heading'].includes(node.type)) return;
    if (node.type === 'paragraph') {
      const { start, end } = node.position;
      const raw = source.slice(start.offset, end.offset);
      if (!raw.split(/\r?\n/u).some((line, i) => Array.from(line).length + (i ? 0 : start.column - 1) > width)) return;
      // Hard breaks are semantic. Reflow each side in a subsequent pass only if
      // explicitly supported; do not silently turn one into an ordinary space.
      if (node.children.some((child) => child.type === 'break')) return;
      const lineStart = source.lastIndexOf('\n', start.offset - 1) + 1;
      const prefix = source.slice(lineStart, start.offset);
      const continuation = prefix.replace(/(?:[-+*]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/gu,
        (marker) => ' '.repeat(marker.length));
      const protectedSpans = [];
      function protect(child) {
        if (['inlineCode', 'link', 'image', 'mdxTextExpression', 'mdxJsxTextElement'].includes(child.type)) {
          protectedSpans.push([child.position.start.offset, child.position.end.offset]);
        } else for (const c of child.children || []) protect(c);
      }
      for (const child of node.children) protect(child);
      let cursor = start.offset;
      let tokenSource = '';
      const atoms = [];
      function prose(text) {
        return text.replace(/\r?\n[ \t]*(?:>[ \t]*)*/gu, ' ');
      }
      for (const [from, to] of protectedSpans) {
        tokenSource += prose(source.slice(cursor, from));
        const placeholder = `\u0000${atoms.length}\u0000`;
        atoms.push(source.slice(from, to));
        tokenSource += placeholder;
        cursor = to;
      }
      tokenSource += prose(source.slice(cursor, end.offset));
      const tokens = tokenSource.trim().split(/\s+/u).map((token) =>
        token.replace(/\u0000(\d+)\u0000/gu, (_, i) => atoms[Number(i)]));
      const lines = [];
      let line = '';
      let budget = width - Array.from(prefix).length;
      for (const token of tokens) {
        if (line && Array.from(line + ' ' + token).length > budget) {
          lines.push(line);
          line = token;
          budget = width - Array.from(continuation).length;
        } else line += (line ? ' ' : '') + token;
      }
      if (line) lines.push(line);
      const value = lines.join(eol + continuation);
      if (value !== raw) edits.push({ from: start.offset, to: end.offset, value });
      return;
    }
    for (const child of node.children || []) walk(child);
  }
  walk(tree);
  let output = source;
  for (const edit of edits.reverse()) output = output.slice(0, edit.from) + edit.value + output.slice(edit.to);
  if (JSON.stringify(canonical(tree)) !== JSON.stringify(canonical(processor.parse(output)))) {
    throw new Error('Wrapping changed the MDX syntax tree; original file preserved.');
  }
  return output;
}
