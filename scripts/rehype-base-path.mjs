/**
 * Rewrite site-root-relative URLs in Markdown/MDX output for a deployed base path.
 *
 * Content is authored with absolute paths (`[Subsystems](/frc/subsystems)`,
 * `![](/media/foo.png)`). When the site is served from a subdirectory — e.g.
 * a subdirectory (`BASE_PATH`) — those links must be prefixed; at the root this is a no-op. Protocol,
 * protocol-relative, hash and query-only URLs are left alone.
 */

const URL_ATTRIBUTES = {
  a: ['href'],
  area: ['href'],
  link: ['href'],
  img: ['src', 'srcset'],
  image: ['href'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  track: ['src'],
  embed: ['src'],
  iframe: ['src'],
  object: ['data'],
  script: ['src'],
};

function normalizeBase(base) {
  const trimmed = (base ?? '/').trim().replace(/\/+$/, '');
  return !trimmed || trimmed === '/' ? '' : trimmed;
}

function prefix(value, base) {
  if (typeof value !== 'string') return value;
  // `//host/path` is protocol-relative, not site-root-relative.
  if (!value.startsWith('/') || value.startsWith('//')) return value;
  if (value.startsWith(`${base}/`) || value === base) return value;
  return `${base}${value}`;
}

function prefixSrcset(value, base) {
  if (typeof value !== 'string') return value;
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return candidate;
      const [url, ...descriptors] = trimmed.split(/\s+/);
      return [prefix(url, base), ...descriptors].join(' ');
    })
    .join(', ');
}

function visit(node, base) {
  if (!node || typeof node !== 'object') return;

  const attributes = URL_ATTRIBUTES[node.tagName];
  if (attributes && node.properties) {
    for (const attribute of attributes) {
      const key = attribute === 'srcset' ? 'srcSet' : attribute;
      const value = node.properties[key] ?? node.properties[attribute];
      if (value === undefined) continue;
      const rewritten = attribute === 'srcset' ? prefixSrcset(value, base) : prefix(value, base);
      if (key in node.properties) node.properties[key] = rewritten;
      else node.properties[attribute] = rewritten;
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child, base);
  }
}

export function rehypeBasePath(options = {}) {
  const base = normalizeBase(options.base);
  return (tree) => {
    if (!base) return;
    visit(tree, base);
  };
}

export default rehypeBasePath;
