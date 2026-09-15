/**
 * Give plain Markdown tables the same look as the <ContentTable> component.
 *
 * A `| a | b |` table in MDX becomes a bare <table> with no class, so it renders
 * with browser defaults while <ContentTable> renders with the site's styling.
 * This wraps every unclassed <table> in `<div class="table-container">` and adds
 * `content-table` to it, so authors can write Markdown tables and get the same
 * result. Tables that already carry a class are left alone.
 */

import { visit } from 'unist-util-visit';

export function rehypeMarkdownTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index == null) return;
      const classes = node.properties?.className ?? [];
      if (classes.length) return;
      node.properties = { ...node.properties, className: ['content-table'] };
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
