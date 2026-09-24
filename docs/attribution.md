# Attributing other teams' code

How FRC 4451 credits code that came from somewhere else, in the robot repositories and on
this site. Written 2026-09-23 after a review of how Cobra, FRC 2910 and FRC 3847 each handle
it. [`documentation-style.md`](documentation-style.md) covers prose;
[`content-authoring.md`](content-authoring.md) covers lesson structure; this file covers
provenance.

FRC shares code freely, and almost every competitive codebase contains work from two or three
other teams. That is healthy. What makes it healthy rather than sloppy is that a reader can
always tell whose code they are looking at and under what terms.

---

## 1. The rule in one line

**Anyone reading a file should be able to tell who wrote it and what they are allowed to do
with it, without leaving the file.**

Everything below is a way of keeping that true.

---

## 2. In a robot repository

### Namespace by origin

Borrowed code lives under the originating team's package, not yours. Cobra already does this:

```
org/littletonrobotics/      FRC 6328's utilities
org/spectrum3847/           FRC 3847's helpers
org/robotzgarage/frc2026/   FRC 4451's own library
```

The import line then carries the attribution to every place the code is used, which a comment
at the top of one file does not. It also survives renames, refactors and file moves.

Adopt the upstream package exactly where you can. `org.littletonrobotics` is what 6328 call
it, so that is what it stays.

### Never strip the header

Most FRC code is MIT or BSD-3, and both licences require the copyright notice to travel with
the code. Removing the header is the one thing that turns borrowing into a licence violation.

Cobra keeps 6328's header intact, which is correct:

```java
// Copyright (c) 2025-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file at
// the root directory of this project.
```

### Add the licence file the header names

That header points at "the LICENSE file at the root directory of this project". The promise
has to be kept, which means one licence file per upstream at the repository root.

FRC 2910 do this completely. Their root carries `LICENSE`, `AdvantageKit-License.md`,
`FRC Team 254-License.md`, `FRC Team 6328-License.md` and `WPILib-License.md`, so every header
in the tree resolves to a real file.

Cobra was incomplete here until 2026-09-23: its root had `AdvantageKit-License.md` and
`WPILib-License.md` and nothing covering 6328's code, so three files carried headers pointing
at a file that did not exist. `FRC Team 6328-License.md` now closes it, and names which of the
three files each upstream copyright line covers.

### Publish your own licence

A repository with no `LICENSE` grants nobody any rights, including other FRC teams who want to
learn from it. Anyone citing such a repository has to describe rather than quote, which is a
real cost paid by the people most likely to be helped.

MIT is the FRC norm: 2910, 254, 6328 and FuelSim all use it, and Cobra took it on 2026-09-23.
Cobra's `LICENSE` also lists the third-party directories that keep their own terms, so the
root file answers "what am I allowed to do with this" for the whole tree.

FRC 3847's repositories still report `NOASSERTION`, which is why the curriculum describes
their code rather than quoting it.

### Record a borrowing with no licence

Sometimes the upstream publishes nothing. `org/spectrum3847/ShiftHelpers.java` in Cobra had no
header at all, and 3847 publish no licence for their own code, so there is nothing to point at.

Silence is the worst option, because the next reader assumes it is FRC 4451's work. Write down
what is true, including the part that is unresolved. Cobra's copy now carries:

```java
// Adapted from FRC 3847 (Spectrum), https://github.com/Spectrum3847/2026-Spectrum
//
// Spectrum publish no license for their own code: the only license file in their
// repository is WPILib's, and GitHub reports the repository as NOASSERTION. No
// permission has been recorded for this copy.
//
// TODO(FRC 4451): ask FRC 3847 whether they will publish a license or grant
// permission in writing. Until then, remove this file if they ask, and do not
// treat it as FRC 4451's work.
```

Recording that permission was never asked is better than implying it was. The `TODO` is the
part that turns a note into an action.

### Credit a design, not just a file

Ideas travel more than files do. GompeiLib's component architecture, FRC 604's simulation
helpers and 254's servo-subsystem pattern all reached other teams as designs rather than as
copied source. A licence does not require credit for that; the norm does, and it costs one
comment:

```java
// Structure follows FRC 254's ServoMotorSubsystem pattern, by way of FRC 2910.
```

---

## 3. On this site

Lesson pages cite rather than redistribute, so the rules are different.

- **Every lesson ends with a `<Sources>` block** naming the specific file or page, through a
  registry id in [`src/data/sources.ts`](../src/data/sources.ts). The registry's `version`
  field carries the licence when it affects what the site may do, for example
  `'main, MIT'` or `'main, no licence published for Spectrum code'`.
- **Quote only what the licence allows.** MIT and BSD-3 repositories (2910, 254, 6328,
  FuelSim, maple-sim) can be quoted with the file cited and the team named. A repository with
  no published licence is described in our own words, and any illustrative code is written
  fresh and labelled `// Proposed` or `// Illustrative`.
- **Name the team in the prose**, not only in the citation. "FRC 2910's `ServoMotorSubsystem`"
  tells the reader whose idea it is while they are reading; a link at the bottom of the page
  does not.
- **Say where a design came from when it has a lineage.** 2910's servo subsystem is 254's
  pattern. The interesting fact for a student is the lineage, not just the current holder.
- **A new licensed source goes on the [References](../src/content/references/index.mdx) page
  and, where material is redistributed, in [`NOTICE`](../NOTICE), in the same change.** That
  rule is in [`CLAUDE.md`](../CLAUDE.md) and it is the one most often forgotten.

---

## 4. Checklist

Before merging a file that came from another team:

1. Is it under the originating team's package namespace?
2. Does it still carry its upstream header?
3. Does the licence that header names exist at the repository root?
4. If there is no upstream licence, does the file say so and name the source?
5. If the design was adapted rather than copied, is the origin in a comment?
6. If a lesson cites it, is the registry entry's `version` carrying the licence?
7. If it is a new source, are the References page and `NOTICE` updated?

---

## 5. Open items

Done on 2026-09-23:

- Cobra has `FRC Team 6328-License.md` at its root, so the three `org/littletonrobotics/`
  headers resolve.
- Cobra has a root `LICENSE` (MIT, FRC 4451), which also lists the third-party directories
  that keep their own terms.
- `org/spectrum3847/ShiftHelpers.java` carries a provenance header.

Still open:

- **Ask FRC 3847 about `ShiftHelpers`.** They publish no licence, and no permission is
  recorded. Either outcome resolves it: they publish a licence, or they grant permission in
  writing, or the file is replaced with our own implementation. Until then the `TODO` in that
  file is the honest state.
- **Confirm the `LICENSE` copyright line.** It reads
  `Copyright (c) 2026 FIRST Robotics Team 4451 (ROBOTZ Garage)`. The licence choice and the
  wording are the team's to make; MIT was picked because it is what 2910, 254 and 6328 use and
  what this document recommends.
