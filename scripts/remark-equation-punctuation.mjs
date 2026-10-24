/**
 * Keep punctuation on the same line as the inline equation before it.
 *
 * Browsers may break a line between an inline <math> element and the text that
 * follows, so `<Equation tex="v_y" />.` can leave the period alone at the start of
 * the next line on a phone. This moves the leading punctuation of the following
 * text into the equation's `trailing` prop, which <Equation> renders inside its
 * non-wrapping span. Display equations are left alone.
 */

import { visit } from 'unist-util-visit';

const LEADING_PUNCTUATION = /^[.,;:!?)\]]+/;

export function remarkEquationPunctuation() {
  return (tree) => {
    visit(tree, 'mdxJsxTextElement', (node, index, parent) => {
      if (node.name !== 'Equation' || !parent || index == null) return;
      if (node.attributes.some((attribute) => attribute.name === 'display')) return;
      const next = parent.children[index + 1];
      if (!next || next.type !== 'text') return;
      const match = next.value.match(LEADING_PUNCTUATION);
      if (!match) return;
      node.attributes.push({ type: 'mdxJsxAttribute', name: 'trailing', value: match[0] });
      next.value = next.value.slice(match[0].length);
      if (!next.value) parent.children.splice(index + 1, 1);
    });
  };
}
