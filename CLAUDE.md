# CLAUDE.md: GarageDocs handoff

Project context for working on **GarageDocs**, FRC 4451's training site: an Astro fork of
[itkan-robotics/mantik](https://github.com/itkan-robotics/mantik) (renamed 2026-09-15; Mantik
remains the framework source and is cited where its outline survives) deployed to GitHub
Pages at the domain root (`/`). Six content sections (Tools, Java, Practice, Kit Bot, FRC, Badges) plus the
Resources catalog. Badges are the team's year-by-year sign-off paths; only Badge 1 (Kit Bot) is written,
and its running draft with open decisions is `Badge 1 Draft.md` in the Obsidian vault. The browser PID Simulation was removed in September 2026 as out of
scope; do not resurrect it.

---

## Role and working rules

Act as a senior WPILib/FRC programmer and mentor. The user is the manager: explain what
is and is not feasible, ask when an assumption is unclear, and do not assume they know
every option.

- **Never run Git commands**, including read-only ones. The user runs every Git workflow
  in VS Code. Delete files with `rm`, never `git rm`.
- **Prose follows [`docs/documentation-style.md`](docs/documentation-style.md)**: no em
  dashes in lesson prose, no rhetorical question-then-answer, no "not X but Y" chains,
  no filler or vague praise, symptoms as evidence rather than diagnoses, "must" only for
  real requirements, sentence-case headings.
- **Site facts must match the sources**: the team's robot code
  (`C:\Users\judso\FIRST Robotics\2026\Cobra2026Private`, `org.robotzgarage.frc2026`)
  and the vendor documentation the References page lists. Do not invent
  API names, values or behaviour; say what needs checking.
- **Every fact about a tool or library is checked against its docs** before it goes in.

## Site structure

- Content: `src/content/<section>/<group>/<lesson>.mdx`. Frontmatter `group`,
  `groupLabel`, `groupOrder`, `order` and `lessonId` drive the sidebar; an overview's
  structure list must mirror the sidebar. See
  [`docs/content-authoring.md`](docs/content-authoring.md).
- Navigation order (`src/config/navigation.ts`): tools, java, assignments, kit-bot, frc, badges.
- Heading anchors are slugs of the heading text; renaming a heading breaks inbound links
  until `npm run links` is clean.
- **Base path:** the site deploys at `/`; a subdirectory build is `BASE_PATH=/x`. Links are authored site-root-relative (`/frc/...`) and wrapped with
  `withBase()` (`withBaseHtml()` for raw HTML props) from `src/lib/url.ts`; MDX links
  are rewritten by `scripts/rehype-base-path.mjs`. Never hardcode a base path.
- **Styling:** plain CSS with tokens on `:root` (`src/styles/global.css`); no Tailwind.
  Reader preferences live in `src/lib/prefs.ts` and are applied as `data-*` attributes
  on `<html>` before first paint. Font sizes are `rem` or `--font-size--*` tokens.

## Verification commands

npm 11.19 or newer only: CI runs Node 24 (npm 11.19), `engines.npm` is `>=11.19.0` and
`.npmrc` sets `engine-strict=true`. Older npm (10.9 and 11.6 both) writes `package-lock.json`
without the `@emnapi/core` and `@emnapi/runtime` peers of `@napi-rs/wasm-runtime`, and
`npm ci` on the runner then fails with "Missing … from lock file"; that broke four pushes.
Regenerate the lockfile only with `npx npm@11.19.0 install --package-lock-only` or a
global npm at that version or newer. npm 11.19 also stops auto-installing optional peers,
so every package the project imports must be declared in `package.json`
(`@astrojs/markdown-remark`, `unist-util-visit` and `@types/mdx` were missing and broke CI's
`astro build` while the local `node_modules` still had them).

| Command | Purpose |
|---------|---------|
| `npm run dev` | http://127.0.0.1:5173/ |
| `npm run build` | Astro + Pagefind; 200+ pages |
| `npm run links` | internal hrefs and heading fragments over `dist/`; must be 0/0 |
| `npx vite-node scripts/test-java-lesson-examples.ts` | compiles and runs every Java lesson fence |
| `npm run verify:assignments` | assignment checks against reference solutions kept outside the repo |
| `npm test` | Vitest over `src/**/*.test.ts` (Java playground) |
| `npm run sources` | every URL cited in a `<Sources>` block responds; lists lesson pages without a block |

Every lesson ends with a `<Sources>` block (see `docs/content-authoring.md`); run `npm run
sources` after adding or editing one. Run build and links after every content change; run the fence test after any edit inside a
Java code fence; run verify:assignments after any Practice edit.

## Java playground

Java lessons run real Java in the browser via CheerpJ + ECJ (`src/lib/java-playground/`,
ported from [mantik-orange](https://github.com/FRC3476/mantik-orange)). Exercises live in
`catalog/*.ts` and mount with `<JavaPlayground id="..." />`; lesson code fences become
runnable automatically for `section: java` only. Java 25 is the curriculum standard; the
browser runs Java 17 (the newest CheerpJ offers), pinned in
`src/lib/java-playground/constants.ts`. The Java 17 setup depends on a staged JDK and a
long-lived compiler process, both explained in [README.md](README.md). In Practice, never
edit `describe` strings or expected-output blocks; they are the hidden checks.

## Provenance

Tools, Java, Practice and Kit Bot are FRC 4451's own writing (Java and Practice with
direct inspiration from USC CSCE 145/146; Kit Bot from FRC 4864's *Scorpion* build (github.com/frc4451/Scorpion2026),
imported once by `scripts/import-robot-basics.py`, which must not be re-run). FRC is
the team's rewrites on Mantik's original outline (cited per page); the PID Tuning Practice group uses Mantik's
[mantik-pid-practice](https://github.com/itkan-robotics/mantik-pid-practice) project and
videos. The two FRC Networking pages are adapted from FSC Open Docs (CC BY-SA 4.0) and
carry an Origin box. The References page and `NOTICE` state all of this;
keep both current, and keep the References page growing with the sources the
lessons cite.

## Collaboration

Codex (OpenAI) runs prose passes in parallel. Shared context lives in the Obsidian vault at
`F:\Claude\FSC Open Docs\Claude Context\Mantik - Garage\` (`Claude Context Doc.md`,
`Codex Context Doc.md`, `Anti Slop Prose Doc.md`, dated records in `Prose Plans\`).
Record each pass there. Site content never references any AI tool other than the
Claude disclosure on the homepage and the Claude and Codex disclosure on the References page.

## Tooling notes

- The Bash tool mangles backslashes and quotes in heredocs; write Python scripts to the
  scratchpad with the Write tool and run them, printing with `PYTHONIOENCODING=utf-8`.
- Frontmatter descriptions containing `: ` must be quoted.
- **React islands:** `client:only="react"` on the Java playground and Resources app. If
  `ReactSharedInternals.H is null` appears, restart the dev server and hard-refresh.
