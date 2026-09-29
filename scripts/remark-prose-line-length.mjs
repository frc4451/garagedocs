import maximumLineLength from 'remark-lint-maximum-line-length';

// Use remark's established rule, scoped to prose rather than MDX attributes.
// Markdown children inside components still count as prose.
export default function proseLineLength(size = 100) {
  const lint = maximumLineLength(size);
  return (tree, file, next) => {
    const lines = new Set();
    function walk(node, prose = false) {
      if (node.type === 'table' || node.type === 'code') return;
      prose ||= node.type === 'paragraph';
      if (prose && ['text', 'inlineCode', 'link', 'image'].includes(node.type)) {
        for (let line = node.position.start.line; line <= node.position.end.line; line++) {
          lines.add(line);
        }
      }
      for (const child of node.children || []) walk(child, prose);
    }
    walk(tree);
    function lintTree(node) {
      if (node.type === 'mdxJsxTextElement') {
        return { type: 'inlineCode', value: '', position: node.position };
      }
      return { ...node, ...(node.children ? { children: node.children.map(lintTree) } : {}) };
    }
    const before = file.messages.length;
    lint(lintTree(tree), file, (error) => {
      file.messages = file.messages.filter((message, index) => index < before || lines.has(message.line));
      next(error);
    });
  };
}
