import temml from 'temml';

/** Render authored LaTeX during the Astro build. Invalid notation fails the build. */
export function renderMath(tex: string, displayMode = false): string {
  return temml.renderToString(tex, {
    displayMode,
    annotate: true,
    throwOnError: true,
    trust: false,
  });
}

/** Explicit LaTeX delimiters in ContentTable's HTML-string cells and headings. */
export function renderTableMath(html: string): string {
  return html.replace(/\\\(([\s\S]*?)\\\)/g, (_match, tex: string) => renderMath(tex));
}
