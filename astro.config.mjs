import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import { pagefindDevPlugin } from './scripts/pagefind-dev-plugin.mjs';
import { normalizeWindowsDevPathsPlugin } from './scripts/normalize-windows-dev-paths.mjs';
import { vscodeEditPagePlugin } from './scripts/vscode-edit-page-plugin.mjs';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { rehypeBasePath } from './scripts/rehype-base-path.mjs';
import { rehypeHeadingLinks } from './scripts/rehype-heading-links.mjs';
import { rehypeMarkdownTables } from './scripts/rehype-markdown-tables.mjs';
import { rehypeRunnableJava } from './scripts/rehype-runnable-java.mjs';
import { remarkJavaNorun } from './scripts/remark-java-norun.mjs';

// Deployment target. The site is served from the domain root (`/`). Override with
// env vars to deploy under a subdirectory, e.g. `BASE_PATH=/garagedocs npm run build`;
// the Pages workflow passes whatever configure-pages reports.
const SITE = process.env.SITE_URL || 'https://frc4451.github.io';
const BASE = normalizeBase(process.env.BASE_PATH || '/');
const analyze = process.env.ANALYZE === '1';

/** Leading slash, no trailing slash (except for the root base '/'). */
function normalizeBase(value) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === '/') return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Add the deployment base to a site-root-relative path. */
function withBase(path) {
  return BASE === '/' ? path : `${BASE}${path}`;
}
// Astro default 4321 falls in Windows excluded range 4239–4338 (Hyper-V/WSL) → EACCES on bind.
const DEV_PORT = 5173;
const DEV_HOST = '127.0.0.1';

export default defineConfig({
  devToolbar: { enabled: false },
  site: SITE,
  base: BASE,
  output: 'static',
  // Preserve links created before Phase 3 was reordered to teach the drivetrain first.
  redirects: {
    // Hardware moved from the FRC subsection to its own top-level curriculum.
    '/frc/hardware-control-system': withBase('/hardware/hardware-control-system'),
    '/frc/electrical-basics-voltage-current': withBase('/hardware/electrical-basics-voltage-current'),
    '/frc/power-wiring-and-can': withBase('/hardware/power-wiring-and-can'),
    '/frc/roborio-and-ni-tools': withBase('/hardware/roborio-and-ni-tools'),
    '/frc/ctre-hardware-setup': withBase('/hardware/ctre-hardware-setup'),
    '/frc/west-coast-products-motors': withBase('/hardware/west-coast-products-motors'),
    '/frc/rev-hardware-setup': withBase('/hardware/rev-hardware-setup'),
    '/frc/thrifty-bot-hardware-and-config': withBase('/hardware/thrifty-bot-hardware-and-config'),
    '/frc/andymark-kitbot-hardware': withBase('/hardware/andymark-kitbot-hardware'),
    '/frc/vivid-hosting-radio': withBase('/hardware/vivid-hosting-radio'),
    '/frc/pololu-voltage-regulators': withBase('/hardware/pololu-voltage-regulators'),
    '/frc/photonvision-coprocessors': withBase('/hardware/photonvision-coprocessors'),
    '/frc/arducam-cameras': withBase('/hardware/cameras'),
    '/hardware/arducam-cameras': withBase('/hardware/cameras'),
    '/frc/quest-3s-and-questnav': withBase('/hardware/quest-3s-and-questnav'),
    '/frc/zebraswitch': withBase('/hardware/zebraswitch'),
    '/frc/hardware-bring-up-checklist': withBase('/hardware/hardware-bring-up-checklist'),
    '/kit-bot/r08-drive-io': withBase('/kit-bot/r07-drive-io'),
    '/kit-bot/r08-drive-io-part-2': withBase('/kit-bot/r07-drive-io-part-2'),
    '/kit-bot/r07-launcher-io': withBase('/kit-bot/r08-launcher-io'),
    '/kit-bot/r07-launcher-io-part-2': withBase('/kit-bot/r08-launcher-io-part-2'),
    '/kit-bot/r07-launcher-calibration': withBase('/kit-bot/r08-launcher-calibration'),
    // FRC lesson ids renamed to match their titles (2026-09-16).
    '/frc/advantagescope': withBase('/frc/reading-a-match-log'),
    '/frc/advantagescope-sim': withBase('/frc/simulation-in-advantagescope'),
    '/frc/controllers-and-bindings': withBase('/frc/controllers-and-inputs'),
    '/frc/frc-code-organization': withBase('/frc/code-organization'),
    '/frc/frc-pid-control': withBase('/frc/pid-control'),
    '/frc/frc-programming-resources': withBase('/resources'),
    '/frc/programming-resources': withBase('/resources'),
    '/frc/geometry-classes': withBase('/frc/pose-geometry'),
    '/frc/intake-command-based': withBase('/frc/command-based-intake'),
    '/frc/intake-example-robot': withBase('/frc/basic-intake-example'),
    '/frc/intro-to-command-based': withBase('/frc/introduction-to-command-based'),
    '/frc/intro-to-motors': withBase('/frc/introduction-to-motors'),
    '/frc/io-layer': withBase('/frc/io-layers'),
    '/frc/manual-pid-tuning': withBase('/frc/manual-tuning-introduction'),
    '/frc/manual-tuning-arm-elevator': withBase('/frc/manual-tuning-arm-and-elevator'),
    '/frc/math-interpolation': withBase('/frc/math-toolbox-units-and-interpolation'),
    '/frc/math-toolbox': withBase('/frc/math-toolbox-geometry'),
    '/frc/motion-magic-why': withBase('/frc/why-motion-magic'),
    '/frc/motor-config': withBase('/frc/motor-configuration-basics'),
    '/frc/motor-current-limiting': withBase('/frc/current-limiting'),
    '/frc/network-troubleshooting': withBase('/frc/robot-network-troubleshooting'),
    '/frc/odometry': withBase('/frc/wheel-odometry'),
    '/frc/physics-sim-io': withBase('/frc/physics-in-the-io-layer'),
    '/frc/pose-estimation-intro': withBase('/frc/introduction-to-pose-estimation'),
    '/frc/sim-autos': withBase('/frc/autonomous-simulation'),
    '/frc/sim-vision': withBase('/frc/vision-simulation'),
    '/frc/swerve-drive-example': withBase('/frc/swerve-pose-estimation-example'),
    '/frc/team-robot-code': withBase('/frc/cobra-repository-tour'),
    '/frc/tunable-constants': withBase('/frc/tunable-constants-and-characterization'),
    '/frc/unit-tests-in-sim': withBase('/frc/unit-tests-in-simulation'),
    '/frc/vision-pose-estimation-fusion': withBase('/frc/fused-pose-estimation'),
    // Tools, Java and Practice ids renamed to match their titles (2026-09-16).
    '/tools/advantagescope-controllers-and-console': withBase('/tools/advantagescope-controllers-and-the-console'),
    '/tools/advantagescope-field': withBase('/tools/advantagescope-poses-on-the-field'),
    '/tools/best-practices': withBase('/tools/version-control-best-practices'),
    '/tools/branching-merging': withBase('/tools/branching-and-merging'),
    '/tools/github-account': withBase('/tools/creating-your-github-account'),
    '/tools/install-git': withBase('/tools/installing-git'),
    '/tools/intro-version-control': withBase('/tools/introduction-to-version-control'),
    '/tools/local-workflow': withBase('/tools/local-git-workflow'),
    '/tools/organizations': withBase('/tools/github-organizations'),
    '/tools/static-ip': withBase('/tools/setting-a-static-ip'),
    '/tools/vscode-hotkeys': withBase('/tools/vscode-keyboard-shortcuts'),
    '/tools/vscode-java': withBase('/tools/vscode-editing-java'),
    '/tools/vscode-workflow': withBase('/tools/vscode-daily-workflow'),
    '/java/java-algo-backtracking': withBase('/java/fundamentals/backtracking'),
    '/java/java-algo-bfs': withBase('/java/fundamentals/breadth-first-search'),
    '/java/java-algo-dfs': withBase('/java/fundamentals/depth-first-search'),
    '/java/java-algo-memoization': withBase('/java/fundamentals/memoization-and-dynamic-programming'),
    '/java/java-algo-recursion': withBase('/java/fundamentals/recursion'),
    '/java/java-algo-searching': withBase('/java/fundamentals/searching'),
    '/java/java-algo-shortest-paths': withBase('/java/fundamentals/shortest-paths'),
    '/java/java-algo-sorting': withBase('/java/fundamentals/sorting-algorithms'),
    '/java/java-algo-tree-traversals': withBase('/java/fundamentals/tree-traversals'),
    '/java/java-control': withBase('/java/fundamentals/control-structures'),
    '/java/java-dp-command': withBase('/java/fundamentals/command-pattern'),
    '/java/java-dp-dependency-injection': withBase('/java/fundamentals/dependency-injection'),
    '/java/java-dp-factory-method': withBase('/java/fundamentals/factory-methods'),
    '/java/java-ds-arraylists': withBase('/java/fundamentals/arraylists'),
    '/java/java-ds-arrays': withBase('/java/fundamentals/arrays-and-their-trade-offs'),
    '/java/java-ds-deques': withBase('/java/fundamentals/deques'),
    '/java/java-ds-graphs': withBase('/java/fundamentals/graphs'),
    '/java/java-ds-linked-lists': withBase('/java/fundamentals/linked-lists'),
    '/java/java-ds-queues': withBase('/java/fundamentals/queues'),
    '/java/java-ds-sets-maps': withBase('/java/fundamentals/sets-and-maps'),
    '/java/java-ds-stacks': withBase('/java/fundamentals/stacks'),
    '/java/java-ds-trees': withBase('/java/fundamentals/trees'),
    '/java/java-executors': withBase('/java/fundamentals/executors-and-thread-pools'),
    '/java/java-fn-functions-as-data': withBase('/java/fundamentals/functions-as-data'),
    '/java/java-fn-lambdas': withBase('/java/fundamentals/lambdas'),
    '/java/java-fn-method-references': withBase('/java/fundamentals/method-references'),
    '/java/java-fn-supplier': withBase('/java/fundamentals/functional-interfaces'),
    '/java/java-intro': withBase('/java/fundamentals/overview'),
    '/java/java-objects-references': withBase('/java/fundamentals/objects-and-references'),
    '/java/java-packages': withBase('/java/fundamentals/packages-and-project-layout'),
    '/java/java-race-conditions': withBase('/java/fundamentals/race-conditions-and-synchronization'),
    '/java/java-static-final': withBase('/java/fundamentals/static-and-final'),
    '/java/java-threads-basics': withBase('/java/fundamentals/threads-and-concurrency'),
    '/assignments/a00-setup-git-repository': withBase('/java/assignments/a00-practice-repository-setup'),
    '/assignments/a02-battery-sanity': withBase('/java/assignments/a02-battery-sanity-check'),
    '/assignments/a10-shooter-lookup': withBase('/java/assignments/a10-shooter-lookup-table'),
    '/assignments/a11-robot-class': withBase('/java/assignments/a11-simple-robot-class'),
    '/assignments/a12-document-robot': withBase('/java/assignments/a12-document-the-robot-class'),
    '/assignments/a13-reference-semantics': withBase('/java/assignments/a13-reference-semantics-lab'),
    '/assignments/a14-robot-and-battery': withBase('/java/assignments/a14-robot-and-battery-composition'),
    '/assignments/a15-match-phase-enum': withBase('/java/assignments/a15-matchphase-enum'),
    '/assignments/a16-subsystem-fleet': withBase('/java/assignments/a16-subsystem-family'),
    '/assignments/a19-sort-roster': withBase('/java/assignments/a19-sorting-a-scouting-roster'),
    '/assignments/a23-ring-buffer': withBase('/java/assignments/a23-generic-ring-buffer'),
  },
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
    sitemap({
      filter(page) {
        const deployedPath = new URL(page).pathname;
        const localPath = BASE === '/' || !deployedPath.startsWith(BASE)
          ? deployedPath
          : deployedPath.slice(BASE.length) || '/';

        if (localPath === '/assignments' || localPath === '/assignments/' || localPath.startsWith('/assignments/')) return false;
        if (localPath === '/java' || localPath === '/java/') return true;
        return !/^\/java\/(?!fundamentals(?:\/|$)|assignments(?:\/|$))/.test(localPath);
      },
    }),
  ],
  markdown: {
    processor: unified({
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
    }),
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
    plugins: [normalizeWindowsDevPathsPlugin(), vscodeEditPagePlugin(BASE), pagefindDevPlugin(BASE)],
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



