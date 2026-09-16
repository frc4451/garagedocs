/**
 * Base-path helpers.
 *
 * Internal paths are written site-root-relative everywhere in this codebase
 * (`/frc/subsystems`). The site deploys at the domain root, so the prefix is
 * normally empty; when it is built under a subdirectory (`BASE_PATH=/x`) every
 * emitted URL needs the base prefix. `import.meta.env.BASE_URL` is set by Astro from `base` in
 * astro.config.mjs and is inlined at build time in both server and client code.
 */

/** Base path with a leading slash and no trailing slash; '' when deployed at the root. */
const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

/** Matches a root-relative URL attribute, e.g. href="/frc/commands". */
const HTML_URL_ATTRIBUTE = /\b(href|src|poster|data)=("|')(\/(?!\/)[^"']*)\2/gi;

/**
 * Prefix a site-root-relative path with the deployed base path.
 * External, protocol-relative, hash and query URLs pass through untouched.
 */
export function withBase(path: string): string {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path;
  if (!BASE) return path;
  if (path === '/') return `${BASE}/`;
  if (path === BASE || path.startsWith(`${BASE}/`)) return path;
  return `${BASE}${path}`;
}

/**
 * Prefix root-relative URLs inside a raw HTML string.
 *
 * Content blocks accept small HTML fragments as props (`<a href="/frc/...">`),
 * which never reach the Markdown rehype pass, so they are rewritten at render.
 */
export function withBaseHtml(html: string): string {
  if (!BASE || typeof html !== 'string') return html;
  return html.replace(
    HTML_URL_ATTRIBUTE,
    (_match, attribute, quote, url) => `${attribute}=${quote}${withBase(url)}${quote}`,
  );
}

/** Remove the base prefix from a runtime pathname, yielding a site-root-relative path. */
export function stripBase(pathname: string): string {
  if (!BASE || !pathname.startsWith(BASE)) return pathname;
  const rest = pathname.slice(BASE.length);
  return rest.startsWith('/') ? rest : `/${rest}`;
}

export { BASE as basePath };
