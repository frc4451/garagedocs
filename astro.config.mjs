import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import { pagefindDevPlugin } from './scripts/pagefind-dev-plugin.mjs';
import { normalizeWindowsDevPathsPlugin } from './scripts/normalize-windows-dev-paths.mjs';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import { rehypeBasePath } from './scripts/rehype-base-path.mjs';
import { rehypeHeadingLinks } from './scripts/rehype-heading-links.mjs';
import { rehypeMarkdownTables } from './scripts/rehype-markdown-tables.mjs';
import { rehypeRunnableJava } from './scripts/rehype-runnable-java.mjs';
import { remarkJavaNorun } from './scripts/remark-java-norun.mjs';

// Deployment target. Defaults to GitHub Pages for this fork
// (https://frc4451.github.io/mantik-garage). Override with env vars to deploy
// elsewhere, e.g. `SITE_URL=https://example.com BASE_PATH=/ npm run build`.
const SITE = process.env.SITE_URL || 'https://frc4451.github.io';
const BASE = normalizeBase(process.env.BASE_PATH || '/mantik-garage');
const analyze = process.env.ANALYZE === '1';

/** Leading slash, no trailing slash (except for the root base '/'). */
function normalizeBase(value) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === '/') return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
// Astro default 4321 falls in Windows excluded range 4239–4338 (Hyper-V/WSL) → EACCES on bind.
const DEV_PORT = 5173;
const DEV_HOST = '127.0.0.1';

export default defineConfig({
  devToolbar: { enabled: false },
  site: SITE,
  base: BASE,
  output: 'static',
  // GitHub Pages normalizes `/foo` -> `/foo/` for directory-style output, so let
  // the host decide rather than enforcing a form Astro cannot redirect to.
  trailingSlash: 'ignore',
  server: {
    port: DEV_PORT,
    host: DEV_HOST,
  },
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
  markdown: {
    // `java norun` on a fence opts an example out of the Run control. The remark
    // plugin marks the code node, but Astro's Shiki step rebuilds every <pre> and
    // drops that mark — so the Shiki transformer below re-reads the fence meta
    // and stamps data-java-norun on the <pre> that actually reaches rehype.
    remarkPlugins: [remarkJavaNorun],
    // Astro normally assigns heading ids *after* user rehype plugins run, so
    // rehypeHeadingIds is listed explicitly first and rehypeHeadingLinks turns
    // each heading into a link to its own anchor. Content links are authored
    // site-root-relative (`/frc/...`); rehypeBasePath rewrites them for the
    // deployed base path. rehypeRunnableJava then wraps Java example fences in
    // the Java lessons so the browser can hydrate a Run control.
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeHeadingLinks,
      rehypeMarkdownTables,
      [rehypeBasePath, { base: BASE }],
      rehypeRunnableJava,
    ],
    shikiConfig: {
      theme: 'github-light',
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
      transformers: [
        {
          name: 'java-fence-meta',
          pre(node) {
            const meta = this.options?.meta?.__raw ?? '';
            if (/(^|\s)norun(\s|$)/i.test(meta)) node.properties['data-java-norun'] = '';
          },
        },
      ],
    },
  },
  vite: {
    plugins: [normalizeWindowsDevPathsPlugin(), pagefindDevPlugin(BASE)],
    server: {
      host: DEV_HOST,
      port: DEV_PORT,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: [
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/language',
        '@codemirror/commands',
        '@codemirror/lang-java',
      ],
    },
    // The Java runner worker loads the CheerpJ script with importScripts().
    worker: {
      format: 'iife',
    },
    ssr: {
      noExternal: ['pagefind'],
    },
    build: {
      rollupOptions: {
        plugins: [
          analyze &&
            visualizer({
              filename: 'dist/stats.html',
              gzipSize: true,
              open: false,
            }),
        ].filter(Boolean),
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/@codemirror') || id.includes('node_modules/@lezer')) {
              return 'codemirror';
            }
            // The worker is its own entry; leave it out of the shared chunk.
            if (id.includes('/lib/java-playground/worker/')) {
              return;
            }
            if (id.includes('/lib/java-playground/')) {
              return 'java-playground';
            }
          },
        },
      },
    },
  },
});
