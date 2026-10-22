/**
 * Give plain Markdown tables the same look as the <ContentTable> component.
 *
 * A `| a | b |` table in MDX becomes a bare <table> with no class, so it renders
 * with browser defaults while <ContentTable> renders with the site's styling.
 * This wraps every unclassed <table> in `<div class="table-container">` and adds
 * `content-table` to it, so authors can write Markdown tables and get the same
 * result. Tables that already carry a class are left alone.
 *
 * A table whose first header is "Row" (the Badge Check tables) also gets
 * `row-id-table`, so its row IDs stay on one line on phones.
 */

import { visit } from 'unist-util-visit';

function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

function firstHeader(table) {
  let header;
  visit(table, 'element', (node) => {
    if (node.tagName !== 'th') return;
    header = textOf(node).trim();
    return false; // stop at the first header cell
  });
  return header;
}

export function rehypeMarkdownTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index == null) return;
      const classes = node.properties?.className ?? [];
      if (classes.length) return;
      const className = firstHeader(node) === 'Row' ? ['content-table', 'row-id-table'] : ['content-table'];
      node.properties = { ...node.properties, className };
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-container'] },
        children: [node],
      };
      return index + 1; // skip the wrapper we just inserted
    });
  };
}
