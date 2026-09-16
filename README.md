# GarageDocs

FRC 4451's programming training site: Tools, Java, Practice, Kit Bot and FRC. Forked from
[itkan-robotics/mantik](https://github.com/itkan-robotics/mantik), whose Astro framework this site
still runs on; the curriculum has been rewritten (see `NOTICE` and the site's References page).

Built with **Astro 5 + MDX + TypeScript**, deployed as a static site on GitHub Pages.

## Quick Start

Node 24 with npm 11 (`engines` enforces `npm >=11`; CI runs the same). An older npm is
refused rather than allowed to rewrite the lockfile into a shape `npm ci` fails on.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173/

The site is served from the domain root in dev and in production. To build under a
subdirectory instead (a project-style GitHub Pages URL), set `BASE_PATH=/garagedocs`;
every internal link goes through `withBase()` / the rehype base-path plugin, so nothing
else changes.

**Search in dev:** Pagefind's index is created at build time. Run `npm run build` once (or `npm run dev:search`); `scripts/pagefind-dev-plugin.mjs` then serves `dist/pagefind/*` to the dev server — no restart needed, and the index reflects the last build, not unsaved edits. Without a build, the search overlay opens and says so instead of doing nothing.

## Build & Preview

```bash
npm run build    # Astro build + Pagefind search index
npm run preview  # Preview production build locally
```

## Java Playground

Java lessons compile and run real Java **in the browser** — no backend, no JDK on
the visitor's machine. [CheerpJ](https://cheerpj.com) provides a WASM JVM, the
Eclipse batch compiler (ECJ) runs inside it as the compiler, and a small launcher
jar (`scripts/java/JpStdioLauncher.java`) redirects stdio through CheerpJ's
virtual filesystem.

Two things become interactive:

1. **Authored exercises** — `<JavaPlayground id="java-arrays" />` in a lesson
   renders a prompt, a starter file, and Run / Check / Reset. `Check` runs hidden
   test cases from `src/lib/java-playground/catalog/*.ts` and diffs stdout.
2. **Every Java fence in `src/content/java/`** — `scripts/rehype-runnable-java.mjs`
   wraps eligible examples with a Run control automatically. Opt a fence out with
   ```` ```java norun ````.

Adding an exercise: append a `pg(id, title, prompt, starter, tests)` entry to the
right catalog file, then drop `<JavaPlayground id="..." />` into the lesson whose
`lessonId` matches.

Two fields exist for the Practice Assignments, where the exercise is the page rather
than a demo beside a lesson:

- `entryClass` — the class the assignment asks the student to write. The editor tab,
  the compiler, and the "wrong class name" message all follow it. Defaults to `Main`.
- A test may carry `pattern` (a regex source) with `describe` instead of `stdout`,
  for output that is partly the student's own — a name, a team number. On failure the
  panel shows the description rather than literal expected text, so a check never
  hands over the answer.

Lesson fences are checked by `npx vite-node scripts/test-java-lesson-examples.ts`,
which wraps each ```` ```java ```` fence the way the playground does and compiles it at
the browser runtime's level. Three things the wrapper does that are worth knowing:

- **Page context.** A fence may use a class that another fence on the same page
  declared — lessons build a `Robot` up over several snippets. The build emits the
  page's fences once as a `<script type="application/json" data-jp-fences>`, and the
  runner splices in the type declarations a snippet references but does not declare
  (earlier fences win; later ones only fill gaps). See `selectPageContext`.
- **Members and statements.** A fragment that mixes methods with statements calling
  them is split: methods into `Main`'s body (made `static` if they had no modifier),
  statements into `main`. A fragment of fields and methods with nothing to run stays
  a class body and reports "no main".
- **Fence meta.** `java norun` keeps a fence static (no Run control) and out of the
  page context — the right marking for deliberately broken illustrations and for
  pseudo-code with `...` in it. `java racy` keeps the Run control but tells the
  checker not to judge the outcome, for a data-race demo that is meant to misbehave.
  Astro's Shiki step rebuilds every `<pre>`, so these marks reach rehype through the
  Shiki transformer in `astro.config.mjs`, not through remark.

### Kit Bot

`src/content/kit-bot/` is a separate section (`/kit-bot`). It was written by the
mentors from FRC 4864's *Skorpion* build and is FRC 4451's own material, edited in
place. Authorship of every section is
listed on the References page and in `NOTICE`. Its Java fences are WPILib code and are deliberately
**not** runnable: `rehype-runnable-java` only wraps fences on pages whose `section` is
`java`, so a new section needs nothing extra to opt out.

`src/content/tools/` (`/tools`) is the first section in the nav: general technical
skills that are not Java and not robot-specific — the command line on PowerShell and
Terminal, general networking, Git and GitHub, Visual Studio Code, then AdvantageScope (the one
robot tool here, because Kit Bot and FRC both use it). Its pages carry no `duration`
(reference material, not sessions) and the estimator skips the section. FRC-specific
networking (`10.TE.AM`, ports, the field) stays under `/frc` and links back for the generic parts.

The References page (`src/content/references/index.mdx`) lists the curriculum sources,
the documentation lessons are written against, and what the site is built with. Add to it
whenever a lesson starts leaning on a new source.

`predev` / `prebuild` download ECJ into `public/java-playground/` (gitignored) and
build the launcher jar (committed; rebuilt only when the Java source changes).
Building the launcher needs a JDK on `PATH`; without one the script keeps the
committed jar.

### Java versions

**Java 25 is the standard** for this curriculum: JavaDoc links, local tooling and the
assignment checks all target it. The browser runs **Java 17** — the newest CheerpJ
offers — which covers records, `var`, text blocks, arrow `switch` and sealed types.
Anything newer is out of reach; pattern matching in `switch` arrived in Java 21.

Every Practice Assignment must therefore work at **both** levels.
`npm run verify:assignments` enforces it: reference solutions are compiled at Java 25
and at the runner's level, then every hidden test runs against both using the same
comparison the browser uses. A check no correct program can pass is worse than no
check at all.

Reference solutions are answers, so they are **not** in this repository. The script
reads them from `scripts/java/solutions/` (gitignored) or `$JP_SOLUTIONS`.

#### How Java 17 works in a browser

Two problems had to be solved, and the fixes are worth knowing before touching
`src/lib/java-playground/`:

**Assembling a JDK.** From Java 9 on the class library is a jimage rather than
`rt.jar`. ECJ decides a directory is a JDK by reading `release` for a `JAVA_VERSION`,
then opens the image through `lib/jrt-fs.jar`. CheerpJ ships `/lt/17/lib/modules` and
neither of the other two, and `/lt` is read-only — so `JpJdkStage` copies all three
into `/files` on first use, where they persist in IndexedDB. Keep the `release` file
minimal: a longer `MODULES` line listing modules the image does not contain makes ECJ
reject the whole directory.

**Keeping the compiler warm.** Loading ECJ and indexing the module image costs about
30 seconds, and CheerpJ keeps no statics between `cheerpjRunMain` calls — so invoking
the compiler per request paid that every time. `JpServer` is started once and left
running, taking requests through a file in `/str` and answering in `/files`. Measured:
first compile ~35 s, subsequent ones ~150 ms.

**Starting early.** The runtime starts from an inline script in the page head
(`src/lib/java-playground/pageStartup.ts`) as soon as a page with runnable markup is parsed,
not when the React islands hydrate, and reports progress in a centred bottom toast
(`[data-jp-runtime-status]` in `BaseLayout`) that dismisses itself a few seconds after the
runtime is ready. `cheerpjPreload.json` lists the runtime chunks CheerpJ fetched in a
warm session so `cheerpjInit` pulls them in parallel; regenerate it after a runtime or JDK
change by running an example, then `await window.__jpDumpResources()` in the console and
saving the JSON. Measured on a warm cache: runtime and staged JDK ready about 6 s after
navigation, compiler server ready about 24 s after (it was 29 s with the idle-time start),
then run-to-output under a second. The start is shared: `preloadJavaRuntime()` returns one
promise for every caller and `isRuntimeReady()` turns true when the compiler server is warm.
A Run or Check clicked before that point does not start; the example shows
"Queued until Java is ready…", holds its Run button, and runs as soon as the runtime
resolves, in click order.

The compiler and the runtime move together. ECJ 3.36 and later are Java 17 bytecode
and will not load on a Java 8 runtime; ECJ 3.16 is Java 8 bytecode and stops at source
level 1.9.

### Static hosting

GitHub Pages serves files only — no serverless functions, no redirect rules. The
Netlify configuration, its submit-resource function, and the Decap CMS admin at
`/admin` were removed with the move to Pages:

- **Resources** at `/resources` is a read-only catalog. Add approved links by
  editing `src/data/resources.json` (sorted by title; majors `java`/`frc`/`general`,
  minors are free text and become the filter chips) — see
  [docs/content-authoring.md](docs/content-authoring.md). Every external tool or doc site
  a lesson relies on should have an entry, and the References page should list it.
- **Content editing** is MDX in the repo; there is no visual editor.
- Sitemap is auto-generated by `@astrojs/sitemap`; search is
  [Pagefind](https://pagefind.app), built in `postbuild`.

## Styling and reader preferences

All styling is hand-written CSS in `src/styles/` driven by custom-property tokens on
`:root` in `global.css`. No CSS framework: a Tailwind migration was evaluated on
2026-09-14 and rejected because lesson bodies are Markdown (styled by element
selectors regardless) and the preferences below only need tokens, not utilities.
The tokens are what make the reader preferences work:

- **`src/lib/prefs.ts`** holds one preferences object (`theme`, `text`, `spacing`,
  `contrast`, `motion`) in `localStorage` under `mantik-prefs` and stamps it as
  `data-*` attributes on `<html>`. An inline boot script in `BaseLayout.astro`
  applies the stored values before first paint (it mirrors the module; keep them in
  step). `PreferencesButton.astro` is the "Aa" button in the header and
  `PreferencesDrawer.astro` the drawer it opens — rendered by `BaseLayout` *outside*
  the header, which is `position: fixed` with a transform and would clip anything
  positioned inside it. It slides in from the right edge, mirroring the navigation
  sidebar. Theme (System / Light / Dark) is chosen there too — there is no separate
  light/dark button.
- **Text size** works because `html { font-size: calc(100% * var(--text-scale)) }`
  and every type token is `rem`. Do not write font sizes in `px`; use the
  `--font-size--*` tokens or `rem`. The two code editors (CodeMirror, Monaco) read
  the root font size so they scale too.
- **Line spacing** is `--body-line-height`, which `article` inherits.
- **High contrast** redefines the foreground/border/link tokens in blocks placed
  *after* the theme blocks in `global.css` — source order matters there because the
  light-when-OS-prefers-dark media block redefines the same tokens.
- **Reduced motion** honours `prefers-reduced-motion` by default and can be forced.

## License

Copyright © 2026 FRC 4451 ROBOTZ Garage. Forked from itkan-robotics/mantik; see NOTICE.
