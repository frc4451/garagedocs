# Documentation style and teaching guide

## Purpose

Use this guide when writing or editing GarageDocs. The compendium preserves programming knowledge collected across seasons so students and mentors can understand it, use it, and pass it on.

The audience is primarily high-school students programming robots for the FIRST Robotics Competition (FRC). Some have years of experience; others have never written a program. State each lesson's prerequisites and explain new concepts without assuming prior knowledge beyond them.

Write like a mentor explaining robot code to a student: direct, practical, and technically accurate. Use enough detail for the reader to understand the explanation and act on it. Shorter is useful only when the meaning stays intact.

## 1. Preserve meaning and technical accuracy

When editing, preserve the author's intent, technical claims, conditions, and useful examples. Remove unnecessary wording without removing information.

- Do not invent facts, sources, test results, robot behavior, or personal experience.
- Keep distinctions that affect correctness, including units, reference frames, operating modes, and software versions.
- Identify suspected technical errors separately from prose changes. Verify corrections against the relevant source before treating them as settled.
- If information is missing or uncertain, state what needs checking. Do not fill the gap with a confident guess.

For example, a Java class defines a type; an object is an instance of that class. Do not call an `Elevator` class an object to simplify the explanation.

## 2. Use plain, direct prose

Use familiar words, concrete subjects, and active verbs. Give each paragraph one main point. Prefer explicit names when a pronoun such as "it" or "this" could refer to several things.

Instead of:

> This approach facilitates the seamless integration of robust mechanism control functionality.

Write:

> This lets the command control the intake through the subsystem's methods.

Remove wording that adds no information, such as "it is important to note," "as we can see," and "in order to" when "to" is sufficient. Replace vague praise such as "powerful," "robust," or "elegant" with the specific behavior or benefit.

Avoid em dashes in curriculum prose. Use a period, comma, colon, or parentheses as appropriate. Preserve punctuation in exact quotations and code. Do not replace every em dash with the same punctuation mechanically.

Avoid rhetorical questions followed immediately by their answers, repeated "not X, but Y" framing, dramatic sentence fragments, and conclusions that repeat the introduction. Use a contrast when it explains a real distinction.

Do not enforce a list of banned words at the expense of meaning. Technical terms such as "robustness" can be appropriate when defined and supported.

## 3. Be conversational without performing a persona

Use "you" for reader actions and "we" for steps the lesson works through with the reader. Contractions are fine. Keep humor occasional and useful.

Avoid forced slang, motivational filler, and invented anecdotes. Do not add "Cool," "congratulations," or "that's the whole idea" to make an explanation sound human. Do not write "on our robot" unless the material actually documents that robot.

Instead of:

> Want to make a motor spin? Cool. Let's do that first. We can worry about making the code pretty afterward.

Write:

> Start by controlling one motor. Once that works, add the second.

## 4. Explain the practical idea before the terminology

Assume the reader can understand the concept once the necessary background is clear. Introduce a technical term where it helps explain the idea, then use it consistently.

For example:

> A drivetrain subsystem keeps the drivetrain's motor control code in one place. Commands use its methods instead of controlling those motors directly. Keeping those details inside the subsystem is an example of encapsulation.

Use analogies only when they clarify something. Explain their limits if those limits affect the lesson. Do not substitute an analogy for the actual behavior.

## 5. Organize lessons around a useful result

For a new concept, a useful sequence is:

1. State what the reader will learn or make the robot do.
2. Identify prerequisites and required setup.
3. Explain the problem the concept solves.
4. Show a small example.
5. Explain how it works and what result to expect.
6. Explain relevant constraints, tradeoffs, and common mistakes.
7. Offer a practice task or link to more detail when useful.

Adapt this sequence to the material. A reference page or troubleshooting note does not need every part of a lesson.

Provide observable results early: a sensor reading changes, a command runs, or a mechanism moves. Include the setup and safety steps needed before running hardware. Use simulation when appropriate and identify differences that matter on a physical robot.

## 6. Layer explanations without hiding requirements

Start with the information needed to understand and use the concept. Put optional background or advanced variations afterward. Keep required constraints next to the instruction they affect.

For example:

> An encoder measures position or changes in position. The code can use those readings to determine how far a mechanism has moved.

Then explain the encoder type, units, direction, conversion factors, and reference position used in the example. Add deeper detail about resolution or measurement limits when the lesson needs it.

Explain unfamiliar syntax in beginner lessons. Once it has been taught, link back or give a brief reminder instead of repeating the full explanation. State prerequisites so readers entering from another page can find what they need.

## 7. Use concrete, focused examples

Prefer examples involving a drivetrain, elevator, arm, intake, shooter, climber, sensor, or controller input. Choose the mechanism that best illustrates the concept; do not add FRC vocabulary merely for atmosphere.

Keep code examples focused on one idea. Label each example as runnable code, a partial snippet, or pseudocode. For runnable examples, include or link to the required setup, dependencies, and relevant versions. For partial snippets, explain what has been omitted and where the code belongs.

Explain inputs, behavior, and expected results. Use names that reflect what values actually represent. A requested motor output is not necessarily a measured motor speed. Do not claim that a half-output setting produces half the maximum speed.

Keep code and prose consistent. If a name, value, or behavior changes, update the explanation too.

## 8. Explain recommendations and their limits

When recommending a design, explain the problem it solves and any cost that matters to the reader. Distinguish requirements from defaults and team preferences.

- Use "must" for a real requirement and explain its basis.
- Use "should" for a recommendation and explain why it applies.
- Use "can" for an available option.

Avoid unsupported "always" and "never" claims. Do not weaken a clear recommendation with "I would probably" or "it depends" unless there is a meaningful uncertainty or condition.

Instead of:

> It depends on your specific use case.

Write:

> If the arm needs a known position after a reboot, provide a position reference, such as an absolute encoder or a homing procedure.

## 9. Respect the reader and explain failures directly

Do not call a concept "easy," "obvious," or "just" a matter of doing something. State the steps and explain difficult parts. Encouragement should come from achievable progress and useful feedback.

When describing a mistake, explain:

- What the reader will observe.
- What may cause it.
- How to check the cause.
- What to change if the check confirms it.

Distinguish a possible cause from a confirmed diagnosis. Prefer "Check the configured direction before changing the control logic" to "Your configuration is wrong."

Place specific hardware warnings before the action that needs them. Explain the hazard and required precaution without burying the instruction in generic warnings.

## 10. Keep terminology and formatting consistent

Maintain a shared glossary for the curriculum. Define an unfamiliar acronym at first use on a page, or link to its definition when the page assumes that knowledge.

Use "robot," "drivetrain," "roboRIO," "Driver Station," "autonomous," and "simulation" as default prose terms. Use shorter forms when already established and helpful. Preserve official capitalization for product names and exact spelling for APIs and code identifiers.

Do not rotate through synonyms for variety. Distinguish terms that could be confused: a driver controller, a motor controller, and a feedback controller are different things.

Use one page title, followed by logically nested headings. Use sentence case for headings. Use numbered lists for ordered steps, bullets for unordered items, and backticks for code identifiers. Reserve bold for information readers need to find quickly.

Use the same name for the same concept across prose, diagrams, exercises, and code. State units and coordinate conventions wherever an omitted assumption could change the result.

## 11. Preserve knowledge across seasons

Keep general explanations separate from season-specific rules, hardware configurations, and team observations. Record the season or software version when it affects whether instructions still apply.

For an experiment, troubleshooting result, or design decision, record the relevant context:

- The question or problem.
- The hardware, software, and conditions involved.
- What was changed or tested.
- What was observed, with logs or measurements when available.
- The conclusion and what remains uncertain.

Do not present one successful test as proof that an approach works in every configuration. Preserve useful older information and label its scope when updating a page.

Link technical claims to the relevant source page or section. Prefer official documentation for API behavior and applicable FIRST documents for competition requirements. Identify team observations as team observations. Record version or date information when needed to interpret a source, and do not invent citations.

## 12. Review before publishing

Check that:

- The page has a clear purpose and appropriate prerequisites.
- The edit preserves meaning and identifies any technical corrections.
- New terms are explained and terminology matches the curriculum.
- Examples match the prose and show the expected result.
- Required setup, units, constraints, and precautions are explicit.
- Recommendations explain their reasons and limits.
- Sources and version details support information that may change.
- Repetition, filler, forced casual language, and unnecessary emphasis are removed.

When reporting an edit, summarize substantive changes and unresolved questions. Do not claim that code was tested or a fact was verified unless it was.

## Accessibility and project conventions

Readers may have different first languages, prior schooling, and access to equipment. Explain prerequisites and provide alternatives where access affects the task. Avoid cultural references that require a shared background.

Tools is reference material without durations or required sessions. Use paired PowerShell and Terminal examples for shell tasks, and separate operating-system labels when configuration differs. Keep YAML workflows and program examples in their actual languages.

Develop and check robot behavior in simulation before hardware confirmation. Describe what simulation can establish and what still requires a physical check. Keep the documented exceptions to lesson duration limits when editing; do not shorten useful material just to meet a word count.

Use the same section names as the navigation: Tools, Java, Practice, Kit Bot, and FRC. Introduce Visual Studio Code (VS Code) as Microsoft's editor. Retain source attribution and the site's disclosure of how lessons are drafted and reviewed.
