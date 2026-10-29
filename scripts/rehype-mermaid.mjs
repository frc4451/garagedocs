/**
 * Render `mermaid` code fences to images at build time.
 *
 * mermaid-isomorphic draws each diagram in headless Chromium (Playwright) twice, once with
 * the site's light colours and once with its dark colours. The fence is replaced by a
 * figure holding both as <img> data URLs; global.css shows the one matching
 * html[data-theme]. The images need no client JavaScript and travel inside the page HTML,
 * so the offline snapshot needs nothing extra.
 *
 * A diagram's `accTitle` becomes the alt text and its `accDescr` a visually hidden
 * description the images point to, so both are required. `click` directives are refused:
 * their links would bypass rehypeBasePath and the link checker.
 */

import { createHash } from 'node:crypto';
import { relative } from 'node:path';
import { createMermaidRenderer } from 'mermaid-isomorphic';

// Mermaid reads only hex colours, so these copy the global.css tokens. Keep them in sync.
export const MERMAID_THEMES = {
  light: {
    darkMode: false,
    background: '#fffaf7', // --color-background-primary
    primaryColor: '#fff0e6', // --color-background-hover
    primaryTextColor: '#18110e', // --color-foreground-primary
    primaryBorderColor: '#e00020', // --color-brand-content
    secondaryColor: '#ffffff', // --color-background-secondary
    tertiaryColor: '#ffffff',
    lineColor: '#57463e', // --color-foreground-secondary
    textColor: '#18110e',
    edgeLabelBackground: '#fffaf7',
    labelBackgroundColor: '#fffaf7',
    transitionColor: '#57463e',
    transitionLabelColor: '#18110e',
    stateLabelColor: '#18110e',
    noteBkgColor: '#ffffff',
    noteTextColor: '#18110e',
    noteBorderColor: '#76665e', // --color-foreground-muted
  },
  dark: {
    darkMode: true,
    background: '#0d0908',
    primaryColor: '#2d1b15',
    primaryTextColor: '#fffaf7',
    primaryBorderColor: '#ff5266',
    secondaryColor: '#1b1210',
    tertiaryColor: '#1b1210',
    lineColor: '#e6d7cf',
    textColor: '#fffaf7',
    edgeLabelBackground: '#0d0908',
    labelBackgroundColor: '#0d0908',
    transitionColor: '#e6d7cf',
    transitionLabelColor: '#fffaf7',
    stateLabelColor: '#fffaf7',
    noteBkgColor: '#1b1210',
    noteTextColor: '#fffaf7',
    noteBorderColor: '#b8a69d',
  },
};

const FONT_FAMILY = 'arial, sans-serif';

// One renderer per build. It launches Chromium on first use and closes it when idle.
let sharedRenderer;

function textContent(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textContent).join('');
}

function isMermaidFence(node) {
  if (node.tagName !== 'pre' || node.children?.length !== 1) return false;
  const code = node.children[0];
  return code.tagName === 'code' && (code.properties?.className ?? []).includes('language-mermaid');
}

function findFences(node, fences = []) {
  for (const [index, child] of (node.children ?? []).entries()) {
    if (isMermaidFence(child)) {
      fences.push({ parent: node, index, code: textContent(child.children[0]), line: child.position?.start.line });
    } else {
      findFences(child, fences);
    }
  }
  return fences;
}

function location(file, line) {
  const path = file?.path
    ? relative(file.cwd ?? process.cwd(), file.path).replaceAll('\\', '/')
    : '<unknown file>';
  return line ? `${path}:${line}` : path;
}

function validate(code, where) {
  if (!/^\s*accTitle\s*:/m.test(code)) {
    throw new Error(`${where}: Mermaid diagram needs an accTitle line; it becomes the image alt text.`);
  }
  if (!/^\s*accDescr\s*(:|\{)/m.test(code)) {
    throw new Error(`${where}: Mermaid diagram needs an accDescr; screen readers announce it.`);
  }
  if (/^\s*click\s/m.test(code)) {
    throw new Error(`${where}: Mermaid click directives are not allowed; link from the prose instead.`);
  }
}

function image(result, theme, descriptionId) {
  const width = Math.ceil(result.width);
  return {
    type: 'element',
    tagName: 'img',
    properties: {
      src: `data:image/svg+xml;base64,${Buffer.from(result.svg).toString('base64')}`,
      alt: result.title,
      width,
      height: Math.ceil(result.height),
      // global.css stops the image shrinking below a readable share of this width.
      style: `--diagram-width: ${width}px`,
      className: [`mermaid-diagram__${theme}`],
      ariaDescribedBy: descriptionId,
      decoding: 'async',
    },
    children: [],
  };
}

/**
 * @param {{ renderer?: import('mermaid-isomorphic').MermaidRenderer }} [options]
 *   `renderer` replaces the Chromium renderer, for tests.
 */
export function rehypeMermaid(options = {}) {
  return async (tree, file) => {
    const fences = findFences(tree);
    if (!fences.length) return;
    for (const fence of fences) validate(fence.code, location(file, fence.line));

    const render = options.renderer ?? (sharedRenderer ||= createMermaidRenderer());
    const codes = fences.map((fence) => fence.code);
    // Each call gets its own config object, so nothing one render changes reaches the next.
    const [light, dark] = await Promise.all(
      ['light', 'dark'].map((theme) =>
        render(codes, {
          prefix: `mermaid-${theme}`,
          mermaidConfig: { theme: 'base', fontFamily: FONT_FAMILY, themeVariables: { ...MERMAID_THEMES[theme] } },
        })
      )
    );

    // Replace from the end so earlier indexes in a shared parent stay valid.
    for (let i = fences.length - 1; i >= 0; i--) {
      const { parent, index, code, line } = fences[i];
      const failed = [light[i], dark[i]].find((result) => result.status === 'rejected');
      if (failed) {
        const reason = failed.reason?.message ?? failed.reason;
        throw new Error(`${location(file, line)}: Mermaid could not render this diagram: ${reason}`);
      }
      const hash = createHash('sha256').update(code).digest('hex').slice(0, 10);
      const descriptionId = `mermaid-description-${hash}-${i}`;
      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['mermaid-diagram'] },
        children: [
          image(light[i].value, 'light', descriptionId),
          image(dark[i].value, 'dark', descriptionId),
          {
            type: 'element',
            tagName: 'p',
            properties: { id: descriptionId, className: ['visually-hidden'] },
            children: [{ type: 'text', value: light[i].value.description ?? '' }],
          },
        ],
      };
    }
  };
}
