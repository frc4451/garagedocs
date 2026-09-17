/**
 * Make every lesson heading a link to itself.
 *
 * Astro's `rehypeHeadingIds` gives each heading an `id` (this plugin must run
 * after it — see astro.config.mjs). This wraps the heading's content in
 * `<a class="heading-link" href="#id">`, so clicking a section title puts its
 * anchor in the address bar and the URL can be shared or linked from another
 * lesson (`/tools/vscode-keyboard-shortcuts#debugging`). Headings without an id, and the
 * page title (h1, rendered by the layout, not by MDX), are left alone.
 */

import { visit } from 'unist-util-visit';

const LINKABLE = new Set(['h2', 'h3', 'h4', 'h5', 'h6']);

export function rehypeHeadingLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (!LINKABLE.has(node.tagName)) return;
      const id = node.properties?.id;
      if (!id) return;
      // Already wrapped (a heading authored as a link, or a second pass).
      if (node.children.length === 1 && node.children[0].tagName === 'a') return;
      node.children = [
        {
          type: 'element',
          tagName: 'a',
          properties: { className: ['heading-link'], href: `#${id}` },
          children: node.children,
        },
      ];
    });
  };
}
