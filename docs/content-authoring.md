# Content Authoring Guide

How to add and edit GarageDocs pages. Follow [Documentation style](documentation-style.md) for prose, terminology, examples, and attribution.

## Where content lives

| Location | Purpose |
|----------|---------|
| `src/content/tools/` | Technical reference pages |
| `src/content/java/` | Java training lessons |
| `src/content/assignments/` | Practice assignments |
| `src/content/kit-bot/` | Kit Bot curriculum |
| `src/content/badges/` | Badge sign-off paths that map the other sections onto the team's year-by-year badges |
| `src/content/frc/` | FRC robotics lessons |
| `src/content/homepage/` | Homepage copy |
| `src/content/references/` | Project sources, authorship and credits |

Each lesson is one `.mdx` file. Sidebar navigation is built from frontmatter — no separate nav config file per lesson.

## Frontmatter reference

```yaml
---
title: Branching and Merging          # Display title
lessonId: branching-merging           # URL slug: /tools/branching-and-merging
section: tools                        # tools | java | assignments | kit-bot | frc | badges (nav order)
# lessonId is the title in kebab-case (leading "The" dropped, "&" written as "and"); the
# file is named after it. Titles are Title Case noun phrases without taglines; a series uses
# "Series: Item" (Manual Tuning: Flywheel; VS Code: Debugging). Java ids keep the `java-` prefix and
# Practice ids the `aNN-` prefix (both are also the JavaPlayground exercise ids in
# src/lib/java-playground/catalog). Renaming an id needs a redirect in astro.config.mjs.
group: version-control                # Sidebar group id (lessons with same group nest together)
groupLabel: "Version Control with Git & GitHub"  # Sidebar group label
groupOrder: 5                         # Sidebar group sort order
order: 4                              # Lesson order within group
difficulty: intermediate              # beginner | intermediate | advanced (optional)
duration: 35 min                      # Optional
description: ""                       # Optional SEO / meta description
draft: false                          # Optional; draft lessons are hidden
isOverview: false                     # true for section overview pages only
---
```

Homepage and References entries use a simpler schema. When a lesson starts using a new
documentation site, library, or repository, add it to `src/content/references/index.mdx`:

```yaml
---
title: GarageDocs
description: Programming and robotics learning for FIRST teams
---
```

## Writing readable MDX

**Do not add component imports.** All block components are registered in `src/mdx-components.ts` and passed via `<Content components={components} />` in page layouts.

### Headings and prose

Use plain markdown:

```mdx
### Working with Branches

Branches allow you to work on different features without affecting main.
```

Every heading gets an `id` slugified from its text (`### Working with Branches` →
`#working-with-branches`) and is rendered as a link to itself
(`scripts/rehype-heading-links.mjs`), so a reader can click a section title to put its
anchor in the address bar. **When a cross-reference is about one section, link to the
section, not the page**: `[Conflict Resolution](/tools/branching-and-merging#conflict-resolution)`
rather than `[Branching and Merging](/tools/branching-and-merging)`. Link the page when the
whole lesson is meant (the `**Cites:**` line on an assignment, a "read this first"). The
same works in LinkGrid `url` entries. Renaming a heading changes its id; the site-wide
link check after a build reports fragments that no longer resolve.

### Code

Use fenced code blocks, not `<CodeBlock />`:

````mdx
```bash
git branch feature-name
git checkout -b new-branch
```
````

### RulesBox / StepsBox / ExerciseBox

Use component tags with **markdown inside** (slot content):

```mdx
<RulesBox title="Robotics Branching Examples">

For robotics teams, you might create:

- `autonomous-improvements` branch for auto code
- `teleop-enhancements` for driver controls
- Keep `main` for competition-ready code

</RulesBox>
```

```mdx
<ExerciseBox title="Practice" description="Try these on your own machine:">

1. Create a branch named `my-feature`
2. Make a commit and switch back to main
3. Merge your branch

```java
// starter code if needed
System.out.println("Hello");
```

</ExerciseBox>
```

Legacy prop style still works (`items={[]}`, `tasks={[]}`) but prefer slots for new content.

### LinkGrid

For internal lesson links:

```mdx
<LinkGrid
  title="Quick Navigation"
  section="java"
  links={[
    { "label": "Introduction to Java", "id": "java-intro" },
    { "label": "Variables", "id": "java-variables" }
  ]}
/>
```

For external URLs, use `url` instead of `id`:

```mdx
<LinkGrid
  title="Further Reading"
  section="java"
  links={[
    { "label": "Git Branching", "url": "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell" }
  ]}
/>
```

### Sources

Every lesson (Tools, Java, Practice, Kit Bot, FRC, Badges; section overviews exempt) ends with a `<Sources>` block, placed before the closing `LinkGrid`: the
documentation pages, Javadoc entries and team-repository files the page was written
against, each with a note saying what the page took from it. Point at the specific page
or file, never a docs home page.

```mdx
<Sources items={[
  {"source": "wpilib", "path": "docs/software/basic-programming/coordinate-system.html", "note": "NWU axes and the rotation convention."},
  {"source": "cobra", "path": "src/main/java/frc/robot/subsystems/drive/Drive.java", "note": "Where the observation queues are drained."},
  {"url": "https://example.org/one-off", "label": "A source outside the registry", "note": "Why it is cited."}
]} />
```

`source` is an id from `src/data/sources.ts` (`mantik`, `mantik-orange`, `cobra`, `riptide`, `ember`, `mech-adv-2024`, `mech-adv`, and `mech-adv-2026` for the Team 6328 classes GarageDocs compares across seasons, `gompeilib` for Team 190's mechanism components, `wpilib`, `wpilib-javadoc`,
`ctre`, `ctre-javadoc`, `rev`, `revlib`, `photonvision`, `photonlib-javadoc`, `questnav`,
`thrifty`, `advantagekit`, `advantagescope`, `pathplanner`, `choreo`, `bline`, `maple-sim`,
`first-manual`, `java-api`, `jls`, `dev-java`, `java-tutorial`, `csce145`, `csce146`, `git`,
`github`, `vscode`, `powershell`, `ms-learn`, `adoptium`); `path` is joined to that source's base URL, and the registry's version
label is shown after the name. Cobra2026 and Riptide2025 are frozen, so `main` is a stable
reference. The items array must be valid JSON (double quotes) because `npm run sources`
parses it. `note` may contain inline HTML such as `<code>`.

### CodeTabs

For vendor-specific or multi-variant code (e.g. Talon FX vs SPARK MAX), wrap fenced blocks in `CodeTab` slots:

```mdx
<CodeTabs>
<CodeTab label="Talon FX">

```java
motor.setControl(new PositionVoltage(targetRotations));
```

</CodeTab>
<CodeTab label="SPARK MAX">

```java
controller.setReference(target, ControlType.kPosition);
```

</CodeTab>
</CodeTabs>
```

For shell instructions, use PowerShell and Terminal tabs even when Git commands are identical. For OS-specific configuration, use a clearly labeled section for each operating system. Keep workflow YAML in a YAML fence.

Use normal markdown fences inside each tab — no JSON `tabs={[]}` prop. Legacy `tabs={[]}` still works in older lessons until migrated.

### When to use TextBlock

Prefer markdown. Use `<TextBlock content={"..."} />` only for legacy HTML that cannot be converted cleanly.

## Adding a new lesson

1. Create `src/content/{section}/{lessonId}.mdx`
2. Set frontmatter (`lessonId`, `section`, `group`, `groupLabel`, `groupOrder`, `order`)
3. Write the body in markdown + components as above
4. Run `npm run dev` and open `http://localhost:4321/{section}/{lessonId}`

The lesson appears in the sidebar automatically when `group` / `groupOrder` / `order` match existing conventions.

## Adding a new sidebar module

Use the same `group` and `groupLabel` on all lessons in the module. Set `groupOrder` to position the module relative to others in that section.

Broad curriculum parts are presentation labels rather than content groups. The Java, Badges, and FRC part labels are assigned in `src/lib/content.ts`. When adding or moving the first module in one of those parts, update the matching part-label map so the sidebar heading stays attached to the correct module.

## Adding a new curriculum section

Requires code changes in several places:

- `src/content.config.ts` — new collection
- `src/config/navigation.ts` — section registry
- `src/lib/content.ts` — sidebar helpers if needed
- Homepage / LinkGrid links

## Migration script warning

```bash
npm run migrate
```

**Destructive:** re-reads `legacy/data/` JSON and **regenerates all of `src/content/`**, wiping hand-edited MDX. Only run when intentionally re-importing from legacy JSON. Back up or commit first.

## Local verification

```bash
npm install
npm run dev       # dev server at 127.0.0.1:5173/
npm run build     # production build + Pagefind index
npm run preview   # serve dist/ (search works here)
npm run links     # after a build: every internal link and #fragment resolves
npm run sources   # every URL in a <Sources> block responds; lists lesson pages without one
```

## Programming Resources catalog

Curated external and internal links live in `src/data/resources.json` (validated at build time with Zod in `src/lib/resources/schema.ts`).

| Task | How |
|------|-----|
| Bulk import from MDX LinkGrids | `npm run seed:resources` (reads FRC hub pages) |
| Add one approved link | Edit `src/data/resources.json` |
| Rich descriptions on regen | Edit `scripts/resource-description-overlays.json` (official URLs) — seed also pulls lesson intros |
| Browse UI | `/resources` — React island in `src/components/resources/` |

### Adding a resource

The public submission form and its Netlify function were removed with the move
to GitHub Pages, which hosts static files only. Add approved links by editing
`src/data/resources.json` directly: give each entry a unique `id` slug, then run
`npm run build` to validate against the Zod schema.

## Durations and sessions

The default lesson target is **45 minutes or less**. Tools pages are references and have no durations or required sessions. Existing exceptions include R00 setup, multi-session assignments and the capstone, and the two-part Arm and Elevator PID practice pages.

- `duration` is generated: `npm run durations` reports, `npm run durations:write`
  updates frontmatter. The estimate is "read it and try the examples" — prose at
  140 words a minute, five seconds per line of code, a few minutes per playground
  or exercise box. It does not count doing every exercise.
- Pages whose time is wall-clock rather than reading — installs, the repo tour, PID
  tuning sessions — set `durationFixed: true` with a hand-written value, and the
  script leaves them alone. The Kit Bot capstone is `multi-session`.
- A lesson the estimator still puts over 45 minutes gets **split into parts** at a
  natural seam (R07, R08 and R09 in Kit Bot are the examples), not shortened.
- Practice Assignments keep the FSC curriculum's estimates for the full assignment.
  Any assignment longer than one sitting carries a *Plan it as sessions* box that
  turns its hidden checks into per-session targets; `npm run sessions:write`
  regenerates those from the catalog.
