/** Identify web links outside the current or published GarageDocs origin. */
export function isExternalWebsite(href: string, currentUrl: string, siteUrl: string): boolean {
  try {
    const url = new URL(href, currentUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return url.origin !== new URL(currentUrl).origin && url.origin !== new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

/** PDF documents open separately so readers keep their place in the lesson. */
export function isPdfLink(href: string, currentUrl: string): boolean {
  try {
    const url = new URL(href, currentUrl);
    return /^https?:$/.test(url.protocol) && /\.pdf$/i.test(url.pathname);
  } catch {
    return false;
  }
}
export function initializeExternalLinks(siteUrl: string): void {
  const update = (link: HTMLAnchorElement) => {
    if (isExternalWebsite(link.href, location.href, siteUrl) || isPdfLink(link.href, location.href)) {
      if (link.target !== '_blank') link.target = '_blank';
      link.relList.add('noopener', 'noreferrer');
    } else if (link.target === '_blank' && /^https?:$/.test(link.protocol)) {
      link.removeAttribute('target');
    }
  };
  const scan = (root: ParentNode) => {
    if (root instanceof HTMLAnchorElement && root.hasAttribute('href')) update(root);
    root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(update);
  };
  scan(document);
  // Search results and React resource cards can be added or reused after initial render.
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof HTMLAnchorElement) {
        update(record.target);
      } else {
        record.addedNodes.forEach(node => { if (node instanceof Element) scan(node); });
      }
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'target'] });
}
