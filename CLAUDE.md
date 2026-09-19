# CLAUDE.md: working on GarageDocs

Instructions for any agent or contributor editing **GarageDocs**, FRC 4451's programming
training site. It is an Astro fork of [itkan-robotics/mantik](https://github.com/itkan-robotics/mantik)
(renamed 2026-09-15; Mantik remains the framework source and is cited wherever its outline
survives), deployed to GitHub Pages at the domain root. Six content sections (Tools, Hardware,
Java with its Practice assignments, Kit Bot, FRC, Badges) plus the Resources catalog and the
References page.

Read this file, then [`docs/documentation-style.md`](docs/documentation-style.md) and
[`docs/content-authoring.md`](docs/content-authoring.md). They are the standard; this file is
the summary and the rules that are easy to miss.

---

## 1. Working rules

- **Do not run Git commands**, including read-only ones, unless the person operating you asks
  for them. The maintainers review and commit in their editor. Delete files with the shell
  (`rm`), never `git rm`.
- **Act as a senior WPILib/FRC programmer and mentor.** The maintainer is the manager: say what
  is and is not feasible, ask when an assumption is unclear, and do not assume they know every
  option.
- **Facts come from sources, never from memory.** Every claim about a tool, library, vendor
  device or the team's robot code is checked against its documentation or the code before it
  goes in. If something cannot be verified, say what needs checking instead of guessing.
- **Finish the verification** listed in section 6 before reporting a change as done.

## 2. Prose standard (the anti-slop rules)

Curriculum prose follows [`docs/documentation-style.md`](docs/documentation-style.md). The
rules that matter most, because they are the ones generated text breaks:

- **No em dashes** in lesson prose. Choose the punctuation the sentence needs: a colon, a
  comma, parentheses, or two sentences. Do not apply one replacement mechanically.
- **No rhetorical question-then-answer.** State the point.
- **No "not X but Y" chains.** Say what it is.
- **No filler or vague praise**: "simple", "easy", "obvious", "powerful", "seamless",
  "robust", "just", "actually", "genuinely". If a word carries no information, cut it.
- **Symptoms as evidence, not diagnoses.** Write what the reader will observe (the number on
  the graph, the console line, the motion) and then what it usually means, with the check
  that confirms it.
- **"Must" only for real requirements** (rules, inspection, safety, API contracts). Advice
  is written as advice with its reason.
- **Sentence-case headings** inside pages; **Title Case titles** in frontmatter, without
  taglines (a series is "Series: Item", as in "Manual Tuning: Flywheel").
- **Plain, direct, conversational without a persona.** One idea per paragraph, concrete
  subjects, active verbs, the practical idea before the terminology, and the useful result
  before the theory that explains it.
- **Preserve meaning when editing.** Removing words is fine; removing conditions, units,
  reference frames, versions or examples is not.

Two naming rules that apply everywhere:

- The team is **FRC 4451**; its software sub-team is the **Automation Team**; the shared
  package `org.robotzgarage.frc2026` is **the ROBOTZ Garage library**. Never "the team",
  "our team" or "programming team" when the subject is the team's own code or people.
  Generic "your team" and other teams by number are fine.
- Site content never references any AI tool except the Claude disclosure on the homepage and
  the Claude and Codex disclosure on the References page.

## 3. Sources and attribution on every page

**Every lesson page in every section ends with a `<Sources>` block**, placed before its
closing `LinkGrid`. Section overviews are exempt; nothing else is. A page without one fails
`npm run sources`.

- Cite the **specific page or file** the text was written against, never a documentation
  home page: the WPILib article, the Javadoc entry, the vendor page, the repository file.
- Use a registry id from [`src/data/sources.ts`](src/data/sources.ts) with a `path`
  (`{"source": "wpilib", "path": "docs/software/…", "note": "…"}`); use `{"url", "label",
  "note"}` only for one-off sources. Add a registry entry when a source will be cited more
  than once.
- The `note` says what the page took from that source. Notes are for the next editor: they
  make a claim traceable.
- Team repositories are cited on `blob/main/` paths. Cobra2026, Riptide2025 and Ember2024
  are frozen, so `main` is stable. Cite only files that exist on `main`; local branches and
  unpushed packages are not sources.
- Quoted code from another team's public repository stays verbatim, with its file cited and
  the team named. Proposed or illustrative code is labelled as proposed.
- The items array is JSON (double quotes). Run `npm run sources` after adding or editing a
  block; it must report 0 failing.

**Provenance is stated, not implied.** Tools, Java, Practice and Kit Bot are FRC 4451's own
writing (Java and Practice take direct inspiration from USC CSCE 145/146; Kit Bot from FRC
4864's *Scorpion* build, [Scorpion2026](https://github.com/frc4451/Scorpion2026), imported
once by `scripts/import-robot-basics.py`, which must not be re-run). FRC is the team's
rewrite on Mantik's outline, credited per page. The PID Tuning Practice group uses Mantik's
[mantik-pid-practice](https://github.com/itkan-robotics/mantik-pid-practice) project and
videos. The two FRC Networking pages are adapted from FSC Open Docs (CC BY-SA 4.0) and carry
an Origin box. The References page and `NOTICE` record all of this: **when a page takes
material from a new source, add the source to the References page and, if licensed, to
`NOTICE`, in the same change.**

## 4. Code and content conventions

**Robot code facts.** FRC lessons are written against FRC 4451's competition code,
Cobra2026Private (a private GitHub repository; ask a mentor for access), and the vendor
documentation the References page lists. Do not invent API names, values or behaviour.
Kit Bot is checked against Scorpion2026. Java 25 is the curriculum standard; the browser
runner is Java 17, pinned in `src/lib/java-playground/constants.ts`.

**Pose geometry naming.** Every geometric value is an arrow named `AToB` (`FieldToRobot`,
`RobotToShooter`, `CameraToAprilTag`); chained arrows add and inner names cancel
(`RobotToAprilTag + AprilTagToField = RobotToField`); `inverse()` swaps the names; a raw
`Translation2d` or `ChassisSpeeds` gets a basis prefix when the axes differ
(`fieldRelativeRobotToHub`, `robotRelativeSpeeds`). The canonical page is FRC's *Pose
Geometry*; use the convention in every pose lesson.

**Lesson ids and files.** `lessonId` is the Title Case title in kebab-case (leading "The"
dropped, `&` written as "and"); the `.mdx` file is named after it. Java ids keep the
`java-` prefix and Practice ids the `aNN-` prefix, and both double as the JavaPlayground
exercise ids in `src/lib/java-playground/catalog`, so a lesson id and its catalog entry
change together. Renaming an id needs a redirect in `astro.config.mjs` and a clean
`npm run links`. Kit Bot ids are exempt for now.

**MDX.** Frontmatter `group`, `groupLabel`, `groupOrder`, `order` and `lessonId` drive the
sidebar; an overview's structure list mirrors the sidebar. Descriptions containing `: ` are
quoted. Heading anchors are slugs of the heading text, so renaming a heading breaks inbound
links until `npm run links` is clean. Components: `RulesBox`, `StepsBox`, `ContentTable`,
`CodeTabs`/`CodeTab`, `LinkGrid`, `Sources`, `JavaPlayground`. Links are authored
site-root-relative (`/frc/…`) and wrapped by `withBase()` in components; never hardcode a
base path.

**Practice.** Never edit `describe` strings or expected-output blocks; they are the hidden
checks. Never edit `scripts/java/solutions/` (reference answers, kept out of the repo).

**Styling and TypeScript.** Plain CSS with tokens on `:root` in `src/styles/global.css`; no
Tailwind. Font sizes are `rem` or `--font-size--*` tokens. Reader preferences live in
`src/lib/prefs.ts` and are applied as `data-*` attributes on `<html>` before first paint.
React islands use `client:only="react"`. Match the surrounding code's naming and comment
density.

**Removed on purpose.** The FTC section and the browser PID Simulation were removed in
September 2026 as out of scope. Do not resurrect either or add links to them.

## 5. Site structure

- Content: `src/content/<section>/<group>/<lesson>.mdx`. Navigation order
  (`src/config/navigation.ts`): tools, hardware, java (Part 1 Fundamentals at
  `/java/fundamentals`, Part 2 Practice Assignments at `/java/assignments`), kit-bot, frc,
  badges; then the Resources and References apps.
- Badges are the Automation Team's year-by-year sign-off paths, rendered as flat lists rather
  than collapsible groups. Badge 1 (Kit Bot) is written; Badges 2 and 3 are placeholders.
  Badge pages carry no durations and no answer key.
- The Java playground runs real Java in the browser via CheerpJ + ECJ
  (`src/lib/java-playground/`, ported from
  [mantik-orange](https://github.com/FRC3476/mantik-orange)). Exercises live in
  `catalog/*.ts` and mount with `<JavaPlayground id="…" />`; lesson code fences become
  runnable automatically for `section: java` only. The staged JDK and the long-lived
  compiler process are explained in [README.md](README.md).

## 6. Verification

| Command | Purpose |
|---------|---------|
| `npm run dev` | dev server |
| `npm run build` | Astro + Pagefind |
| `npm run links` | internal hrefs and heading fragments over `dist/`; must be 0/0 |
| `npm run check` | `astro check`; must be 0 errors |
| `npm run sources` | every URL cited in a `<Sources>` block responds; lists lesson pages without a block; must be 0 failing |
| `npx vite-node scripts/test-java-lesson-examples.ts` | compiles and runs every Java lesson fence |
| `npm run verify:assignments` | assignment checks against the reference solutions |
| `npm test` | Vitest over `src/**/*.test.ts` (Java playground) |

Run build and links after every content change; sources after any `<Sources>` edit; the
fence test after any edit inside a Java code fence; verify:assignments after any Practice
edit; check after any TypeScript or Astro change.

**npm 11.19 or newer only.** CI runs Node 24; `engines.npm` is `>=11.19.0` and `.npmrc`
sets `engine-strict=true`. Older npm writes a lockfile CI rejects. Regenerate
`package-lock.json` only with `npx npm@11.19.0 install --package-lock-only`, and declare
every package the project imports in `package.json` (npm 11.19 does not auto-install
optional peers).

## 7. Collaboration

More than one agent works on this repository, sometimes at the same time. Astro clears
`dist/` at the start of a build, so a build by one agent can make another's `npm run links`
or preview fail mid-run; rerun rather than debug. The maintainers keep shared session notes
and dated pass records outside the repository; ask where they are and record substantial
passes there. Before editing a file another agent may hold, re-read it.

## 8. Tooling notes

- On Windows shells, heredocs mangle backslashes and quotes; write scripts to a temporary
  file and run them, with UTF-8 output.
- If `ReactSharedInternals.H is null` appears in the dev server, restart it and hard-refresh.
