# Kit Bot and Badge 1 curriculum review

Reviewed September 17, 2026.

## Scope and audience

Reviewed all 26 Kit Bot pages and all 9 Badge 1 pages against docs/documentation-style.md. Revised 33 curriculum pages. The two hardware setup pages were reviewed and retained. Hardware, Tools, and Java resource content was not edited.

Kit Bot assumes the linked Java foundations and explains robot-specific terms. Badge 1 explicitly welcomes ninth-grade students with no programming background. Students may use notes, ask questions, practice with a mentor, and repeat an unfinished check without losing completed signatures.

## Changes by phase

| Area | Changes |
|---|---|
| Kit Bot overview and setup | Explain the simulation-first path, separate hardware sessions, preserve generated Gradle configuration, and describe template files accurately. |
| Lifecycle and first subsystem | Distinguish periodic calls from running the whole program; explain state, API, scheduler, and command requirements; make heartbeat evidence match the code. |
| Drive and launcher IO | Give file paths and missing imports, label complete files and partial additions, correct steering signs and mixed-input voltage scaling, and keep independent feeder and intake-launcher control. |
| Distance table and characterization | Explain interpolation, positive-motion units, requested versus applied voltage, settling assumptions, and calculations with a full sample set. Keep immutable measures and manual kS/kV work. |
| Integration and telemetry | Preserve previously taught controller bindings when replacing RobotContainer. Restrict the final default drive command to teleop. Separate graph units and explain saved logs and simulation-only heading. |
| Autonomous and capstone | Add chooser imports, test Do nothing with stick input, distinguish zero output from instant physical stopping, and align repository and demonstration requirements. |
| Badge 1 | Align steps, required evidence, and paper sign-off. Keep Boolean Logic mandatory, including modus ponens and modus tollens. Break the Java reading list into groups with assignment checkpoints. Clarify setup assistance, fresh-clone checks, and supervised hardware work. |
| Worksheet | Add operator notation, clarify predicate inputs and equivalent-expression tasks, use classroom premises for inference, and remove public model answers from the final mentor questions. Update the ignored local worksheet key to match. |

## Verification

- Production build passed.
- Internal links: 477 pages, zero missing targets, zero bad fragments.
- Existing Java-fence check: 242 compilations passed; 154 executable examples ran successfully.
- Compiled 16 integrated Kit Bot classes, including real and simulation IO, characterization, telemetry, pose, retained controller bindings, and autonomous chooser, against installed WPILib 2026 libraries and official REVLib 2026.0.5. No compiler errors or warnings after updating REV imports.
- Checked generated worksheet HTML: tables retain the intended columns and Boolean OR renders intact.
- Existing Sources blocks were preserved.

## Teaching limits

This is an editorial and code-compilation review, not a physical-robot test or a student classroom trial. First deployment still requires mentor checks of wiring, motor directions, configuration, and safe test conditions. Characterization is a guided lesson; students can use the equations and a calculator. The simulated field pose does not establish accurate real-robot heading without a gyro.

The intended next classroom check is to watch a first-year student follow one lesson from file creation through its Done when check, noting instructions they cannot act on without additional explanation.
