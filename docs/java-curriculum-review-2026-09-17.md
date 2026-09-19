# Java curriculum review, September 17, 2026

## Scope and teaching goal

Reviewed all 61 existing Java Fundamentals lessons, all 29 Practice assignment pages (A00–A28), and the three Java/Practice overview pages. Added three short Fundamentals lessons, bringing the lesson count to 64. The audience is high-school students and mentors; the first groups assume no programming experience. Advanced algorithms and concurrency remain further study rather than universal prerequisites for starting robot work.

Used the project's documentation and prose standards. Preserved the assignment checks, reference solutions, code/output fences, images, source attribution, and stable lesson URLs. No Git commands were run and no images were generated.

## Reading order

1. Java Basics: setup, printing, variables, strings, calculations, console input.
2. Programming Logic: control structures, conditionals, methods, Math helpers, exceptions.
3. Loops: while, for, arrays, loop control, loop practices.
4. Object-Oriented Programming: classes, objects, references, static/final, overloading, inheritance, abstract classes, interfaces, polymorphism, enums/records, packages.
5. Data Structures: array tradeoffs, ArrayList, generics, linked lists, stacks, queues, deques, sets/maps.
6. Functions as Data: callbacks, lambdas, functional interfaces, method references, streams.
7. Programming Math: Boolean logic, discrete foundations, vectors, matrices. This also works as a reference branch.
8. Algorithms: recursion, Big-O, searching, sorting, trees, graphs, traversals, shortest paths, backtracking, dynamic programming.
9. Design Patterns.
10. Concurrency.

Metadata and Next lesson cards follow this order. Existing file locations and lesson IDs remain stable. Overviews explain which Fundamentals topics support each Practice track. Assignment preparation links identify additional topics, including enums for A06 and insertion sort for A10.

## Main changes

- Added Strings, Console Input, and Enums and Records primers. These cover concepts the assignments previously required without a focused introductory lesson.
- Replaced oversized beginner exercises with bounded tasks and observable results. Moved custom object-array examples into the post-OOP array lesson.
- Rewrote Practice scenarios with direct instructions and removed pressure, invented anecdotes, and claims that a particular approach is obvious or universally best.
- Distinguished console teaching models from physical robot behavior, including battery thresholds, fictional match times, joystick outputs, and climber simulation.
- Restored the battery formula verbatim and explained its units. Corrected the integer-arithmetic explanation.
- Clarified the missing Encoder Smoother Part B as an optional local extension, removed stale statements that browser-supported assignments are unavailable, and separated required outputs from extensions.
- Corrected empty-stack peek behavior, blocking-deque choice, lambda/anonymous-class differences, equality/hashCode, volatile and synchronized semantics, recursion limits, Fibonacci call counts, and claims that timing measurements prove complexity.
- Corrected PowerShell sample-input commands and clarified local Java 25 versus browser Java 17 versus WPILib's bundled JDK.
- Added explicit access modifiers to revised Java lesson declarations while keeping intentionally invalid examples identified as such.

## Badge 1 alignment

Step 5 follows the revised order. It now lists 31 lessons instead of 27: the three short primers and Abstract Classes fill preparation needed by the existing assignments. The same 14 assignments remain required. The page identifies the enum primer before A06 and insertion-sort preparation for A10. It does not require the entire advanced Java catalog.

## Runner repair

Making declaration visibility explicit exposed six compiler failures in multi-type lesson snippets. The example wrapper now selects the top-level type containing main when present, retains only the matching public top-level declaration in its compiler copy, and preserves public/static nested types. Authored lesson declarations remain explicit. Added two regression tests for sibling public types and a public interface preceding a final class with main.

Files: src/lib/java-playground/exampleSource.ts and exampleSource.test.ts.

## Verification

- Production build and offline snapshot completed.
- Internal links: 483 pages, zero missing targets and zero bad fragments.
- Sources: 829 URLs, zero failing. An earlier run had transient fetch errors; a subsequent full run passed.
- Astro/TypeScript: zero errors, zero warnings, nine hints.
- Playground tests: 52 passed.
- Java fence check: 402 fences; 146 intentionally non-runnable/skipped by the existing checker; 256 compiled successfully; 166 ran successfully; 90 are declarations without main; zero compilation or runtime failures.
- Practice reference checks passed at both Java levels.
- Compared all 29 backed-up assignment/overview pages: no code or output fence changes remain.

## Practical limits

Compilation and checks verify examples, not classroom pacing. A mentor should have a first-time student explain and modify an example at each group checkpoint. The browser Java runtime still requires internet. Existing assignment starter templates and hidden checks were not rewritten; this pass revised their instructions and preparation links.
