---
name: docs-prose-style-guide
description: GarageDocs Docs Prose Style Guide (formerly the Mentor Voice Prose Guide). Use before writing, editing or reviewing any GarageDocs prose (lessons, badge pages, overviews, headings, frontmatter titles, prose review reports). It sets the mentor voice, Title Case headings, sentence rules, accuracy checks and the review report format, and it outranks docs/documentation-style.md.
---

# Docs Prose Style Guide

Status: agreed with the maintainer on 2026-09-23 and refined against the maintainer's Badge 1 voice reference. The maintainer also authorized structural edits and selected short Title Case headings. Added to the repository on 2026-10-20 so every agent and machine reads the same copy. Refined the same day with the badge-page rules, flow rules, AI-pattern catalogue and editing workflow below, adapted from writing skills listed on skills.sh. This file is the definitive guide; edit it here, not in any other copy.

Paths below are relative to the repository root.

## Authority

Write as an experienced robotics mentor explaining a concept to a high-school student. Give readers enough information to understand the idea, carry out the task, and recognize the result. Preserve useful technical depth and remove wording that gets in its way.

When sources disagree, the higher one wins (maintainer decision, 2026-10-20):

1. The maintainer's current instructions and agreed project decisions.
2. This guide.
3. `CLAUDE.md`, `docs/documentation-style.md` and `docs/content-authoring.md`.
4. The external skills listed under Skills, which supply additional checks.

The maintainer's decisions recorded here supersede older instructions that require sentence case inside pages or separate approval for routine structural edits within a requested cleanup. Apply the Title Case and editing rules below when those older instructions conflict.

The current standards were checked on 2026-09-23. Re-read applicable standards before later editing passes. Historical review notes are leads to verify, not proof of the current site's behavior.

## Voice and Teaching

- Be direct, patient, conversational, and technically precise. Contractions are welcome. Avoid forced slang, invented anecdotes, motivational filler, and promotional language.
- Use “you” for reader actions. Use “we” for an explanation or example the lesson develops with the reader. Badge pages use “the student” and “the mentor,” preserving the documented exception for quoted mentor questions on the sign-off page.
- State prerequisites and explain new terms where they become useful. Introduce the practical idea before its formal name when that helps understanding.
- Explain why a step matters when the reason helps students use, troubleshoot, or transfer the knowledge. Keep conditions and precautions beside the actions they govern.
- Match depth to the page's purpose. Tutorials need visible progress; reference pages need accurate lookup information; conceptual explanations need reasoning and examples. These purposes can coexist within a lesson when the transitions are clear.
- Use concrete robotics examples where they clarify the idea. Preserve examples, constraints, and explanations that carry instructional value.

## Badge 1 Voice

The maintainer identified the hand-edited Badge 1 pages as the voice reference. All nine current source pages in `src/content/badges/badge-1/` were read on 2026-09-23: the overview, pretest, accounts and tools, Git, Boolean logic, Java, simulation, hardware, and sign-off pages. This was a reading for voice; technical claims and external sources were not audited in that pass.

The recurring patterns below refine what “an experienced mentor” means for GarageDocs. They describe the selected reference as a whole; they do not attribute every sentence to a particular author. Each example was re-checked against its file on 2026-10-20; search for the quoted words, because line numbers drift.

| Pattern to preserve | Example from Badge 1 | How to apply it |
| --- | --- | --- |
| State the task in ordinary language. | “Step 5 teaches the Java the Kit Bot lessons use.” (`badge-1-java.mdx`) | Open with the concrete purpose. Let the explanation establish its value. |
| Define a term where it becomes useful. | “A **fresh clone** is a new copy downloaded from GitHub into a different folder.” (`badge-1-simulation.mdx`) | Give a brief definition near the action that needs it. Add the practical reason when it helps. |
| Name who acts and what they show. | “At a sign-off, the student operates the tools and explains their choices to a mentor.” (`badge-1.mdx`) | Make responsibility and evidence explicit. Preserve useful repetition of “the student” and “the mentor.” |
| Show patience through the process. | “The student practices any missed action with the mentor, then repeats that action alone.” (`badge-1-tools.mdx`) | Give a concrete next step after difficulty. Support and independent demonstration belong together. |
| Preserve progress while requiring understanding. | “A mistake during practice does not erase completed rows.” (`badge-1-git.mdx`) | State what remains complete and what needs another attempt. Keep requirements explicit. |
| Give a reason without a long preamble. | “Each lesson should be done in sequence. They build upon each other.” (`badge-1-simulation.mdx`) | Keep an instruction and its useful reason close together. Preserve natural, brief phrasing. |

The warmth comes from allowing questions, providing help, and respecting the student's progress. The expectations remain concrete: complete the work, demonstrate the result, and explain the reasoning in the student's own words.

Keep the reference's practical vocabulary, such as “show the mentor,” “done when,” “what they would check first,” and “what the result shows.” Use tables to make requirements comparable and short paragraphs to explain how the process works. Brief labels, table fragments, and summaries such as “Twenty points total” are useful when their context makes the meaning complete. Do not expand them solely to satisfy a sentence rule.

Transfer these habits to other sections while keeping their established perspective. Badge pages document student and mentor responsibilities in third person; lessons can address the reader as “you.” Incidental typos, isolated capitalization differences, and possible factual inconsistencies do not establish new style rules. Preserve distinctive phrasing when it is clear, and edit when a change improves meaning, accuracy, or readability.

## Badge Pages

Badge pages state what the student does, what the mentor checks, and what evidence closes each row. These rules apply to every badge page and come from the maintainer's 2026-10-20 Badge 3 decisions.

- Write in third person: "the student" and "the mentor." Never use "you" or "your." A bare imperative ("Record the margin beside each value.") is an instruction to the student. Write every mentor action as "The mentor …". Keep one actor per sentence.
- Use one name per concept across the badge, its sign-off sheet and its mentor documents. When a page introduces a term, define it once at first use and repeat the same term afterward instead of rotating synonyms. The Badge 3 names are: setup sheet; commissioning record; the Step 6 launch experiment; fuel world, camera world and combined simulation; another member; diagnostic, mastery attempt and final; step (never module); true pose and estimated pose; presence, readiness policy and guard; Starter baseline, enabled baseline and physical voltage baseline; CTRE simulation; launch elevation; slip factor.
- Point students to starting points (Cobra's classes in their fork, the linked lessons, vendor documentation) and describe the method in enough detail that they can carry it out. Do not state an answer the step asks them to work out, predict or design. When a derivation is the point of the step, give every stage of the method, in order, with the quantities and units to use.
- Keep For the Mentor notes to file and test names, not method or field names. Values, signatures, design answers and prediction answers stay in the mentor solution.
- Sources notes render on the page, so on badge pages a note says what the source covers ("read to find how a delayed frame is rendered"), never the finding the step asks the student to make. Record the finding in the mentor solution's `SOURCE-FINDINGS.md` (maintainer decision, 2026-10-21).
- Use the shared Badge Check legend, trimmed to the codes the page's rows use. Keep the single Badge Check table; do not add durations or schedules.

## Flow

A page flows when each sentence uses only what the reader already has and each paragraph leads into the next.

- Introduce a term, file, value or tool before a later sentence depends on it. If it belongs to another step or lesson, link that page at first use. Do not use a name and define it two paragraphs later.
- Order a section as: what the student does and why, how to do it, and how to check the result. Put a scope statement such as "The task is simulation-only." beside the purpose it limits, not at the end of a paragraph.
- Keep a paragraph on its topic. Move a sentence that belongs to another section instead of leaving it as the last line of the wrong one.
- Connect sentences with the real logical link ("because," "so," "then," "after," "until") or let the paragraph break carry the change of topic. Do not use stock transitions such as "Moreover," "Furthermore," "Additionally," "That said," "With that in mind," "Moving forward," "When it comes to" or "In conclusion."
- Say a point once. When a later paragraph needs it, refer back to it ("that assumption") instead of restating it in new words.
- End a section on its last useful instruction or fact. Do not add a closing sentence that summarizes what the section said.
- Vary sentence openings. Three sentences in a row that start with the same subject usually read as a template; merge them or reorder them unless the repetition is deliberate, as in parallel steps.

## AI Patterns to Remove

Generated text has recognizable habits. The catalogue below is adapted from blader/humanizer (MIT), jpeggdev/humanize-writing, and Wikipedia's "Signs of AI writing." Use it to find candidates, then judge each one in context: one weak sign alone is not a defect, several together are. Never change quotations, code, API names, product names or official labels to remove a pattern, and keep technical terms in their literal sense ("robust control," "vector").

| Pattern | What it looks like | Fix |
| --- | --- | --- |
| Staged contrast | "not X but Y," "not just X, it's Y," where nobody believed X | State Y. Keep a contrast only when it corrects a mistake a student is likely to make. |
| Run-ups and closers | "Let's dive in," "It's worth noting that," "Importantly," "Here's the thing"; a final line that restates the paragraph | Delete the run-up or closer and keep the point. |
| Arguing with no one | Rejecting an option or answering an objection the page never raised | Delete it, unless it is a common student mistake worth naming. |
| Inflated significance | "crucial," "pivotal," "vital role," "key," "powerful," "seamless," "comprehensive," "game-changer"; "essential" for something optional | Name the specific effect, or drop the word. Use "must" only for real requirements. |
| AI vocabulary | "delve," "leverage" (as a verb), "navigate" and "landscape" (figurative), "ecosystem" (non-technical), "streamline," "unlock," "empower," "elevate," "harness," "realm," "myriad," "tapestry" | Restructure the sentence with an ordinary verb. A synonym swap is rarely enough. |
| Avoiding "is" and "has" | "serves as," "stands as," "acts as," "functions as"; "boasts," "features," "offers" | Write "is" or "has." |
| Tacked-on "-ing" phrase | ", ensuring …," ", allowing …," ", highlighting …," ", reflecting …" at the end of a sentence | Delete it, or make it its own sentence with a stated cause. |
| Vague association | "related to," "tied to," "associated with" without the actual relationship | Name the relationship: "calls," "reads," "sets," "depends on." |
| Borrowed authority | "best practice," "teams often," "experts recommend" without a source | Cite the source, or state the reason directly. |
| Forced triad | Three items where the meaning has two, or a third item that repeats the second | Keep the items the content needs. |
| Stacked hedges | "may potentially," "can often help to," "might possibly" | Keep one qualifier the evidence supports. |
| Synonym cycling | "controller," "motor controller," "device," "unit" for the same thing | Pick the established name and repeat it. |
| False range | "from X to Y" where X and Y are not ends of a scale | List the actual items. |
| Decorative bold and labels | Bold on scattered words; a bold label and colon on every list item | Bold only a term at its definition or information a reader scans for. Turn labelled lists into prose when the labels add nothing. |
| Narrating the page | "This section will explain," "Below we will," "As mentioned above" | State the content. A one-line purpose statement such as "Step 5 teaches the Java the Kit Bot lessons use." is fine. |
| Chatbot residue | Greetings, praise, offers, "I hope this helps," knowledge-cutoff disclaimers | Delete. |

Some advice in those skills does not apply here. Headings stay in Title Case. Do not add opinions, humor, first person, fragments or "But" and "So" sentence openers to make text sound human; the mentor voice comes from clear teaching, not from a persona. Em dashes stay out of lesson prose regardless of the surrounding text's habits. Leave existing quotation-mark style alone.

## Editing Workflow

1. Read the whole section before changing anything, and mark the patterns above and any flow problems.
2. Rewrite each marked passage by stating its point directly. Do not patch one phrase at a time.
3. Check the rewrite against the original: every requirement, condition, unit, version, example and link survives, and nothing new is claimed without a source. An added fact or a lost requirement is an error.
4. Read the rewrite aloud. Mark anything a mentor would not say to a student at the bench, then scan again for patterns that survived.
5. Wrap the file (`node scripts/wrap-mdx.mjs`) and run the checks in `CLAUDE.md`.

## Sentences

- Give each paragraph one main point and connect its sentences in a logical order. Prefer concrete subjects and active verbs. Use passive voice when the actor is irrelevant or the result deserves emphasis.
- Vary sentence length naturally. Split sentences that overload the reader or conceal a condition. Word counts are prompts to inspect a sentence, not limits to enforce.
- Keep modifiers beside what they modify. Give “this,” “it,” and “they” clear referents. Repeat a technical noun when repetition prevents ambiguity.
- Use one established name for each concept. Preserve exact API names, filenames, commands, units, and product capitalization.
- Remove filler, vague praise, repeated summaries, decorative contrasts, and rhetorical question-and-answer openings. Evaluate words in context; retain literal technical uses such as “vector,” “primitive,” and “flywheel.”
- Preserve uncertainty when evidence is incomplete. Use “must” for requirements, “should” for recommendations with a reason, and “can” for options.

## Headings and Layout

- Use Title Case with lowercase minor words for frontmatter titles, headings inside pages, and heading-like component titles. Capitalize major words, but lowercase the agreed articles, conjunctions, prepositions, and project-specific joiners when they are not the first or last word.
- Lowercase these articles and conjunctions inside a title: `a`, `an`, `the`, `and`, `but`, `or`, `nor`, `so`, and `yet`.
- Lowercase these common prepositions inside a title: `about`, `above`, `across`, `after`, `against`, `along`, `among`, `around`, `as`, `at`, `before`, `behind`, `below`, `beneath`, `beside`, `between`, `beyond`, `by`, `despite`, `down`, `during`, `except`, `for`, `from`, `in`, `inside`, `into`, `like`, `near`, `of`, `off`, `on`, `onto`, `out`, `outside`, `over`, `past`, `per`, `since`, `than`, `through`, `throughout`, `to`, `toward`, `towards`, `under`, `underneath`, `until`, `up`, `upon`, `versus`, `via`, `with`, `within`, and `without`.
- Lowercase these additional GarageDocs joiners inside a title: `that`, `then`, `this`, `these`, and `those`.
- Always capitalize the first and last word. Preserve proper names, acronyms, official labels, API names, and code spelling. Capitalize a particle when it belongs to a phrasal verb, such as “Set Up,” “Log In,” “Show Up,” or “Turn On.” Review hyphenated terms individually instead of changing part of a compound mechanically. Keep operators and code terms exact, such as “AND, OR, and NOT,” `` `for` ``, and `` `this()` ``. Continue capitalizing verbs such as `Is`, `Are`, `Be`, `Run`, `Read`, and `Use`.
- Prefer short, plain, specific headings such as “Badge Check,” “Required Work,” or “Common Blockers.” Preserve proper names and official labels.
- Make headings easy to link to: use clear words, avoid unnecessary punctuation, and distinguish headings on the same page. Keep the site's normal generated anchors; for example, “Badge Check” becomes `#badge-check`. Shorten a heading only when its purpose remains clear.
- Use connected prose for explanations, numbered lists for ordered steps, bullets for parallel items, and tables for comparisons. Keep list items grammatically parallel.
- Avoid em dashes in authored lesson prose. Choose punctuation that fits the sentence. Preserve exact quotations and code; leave existing quotation-mark style alone during prose edits. Semicolons are allowed when useful.
- Use descriptive link text and link to the relevant section where possible. Before renaming a heading, find links to its existing anchor. Update affected internal links and verify them after the build. Preserve a known shared anchor when the site supports doing so; report any unresolved link impact.
- Explain the meaning of informative diagrams in text. Check heading order, image descriptions, and table structure. Inspect rendered pages when wrapping, formatting, or component behavior could affect comprehension.

## Skills

| Skill | Role | Limits for GarageDocs |
| --- | --- | --- |
| technical-writing ([cursor/plugins](https://github.com/cursor/plugins/blob/main/pstack/skills/technical-writing/SKILL.md); user-level install) | Page purpose, procedural clarity, consistent terminology, and ambiguous sentences. | Keep necessary teaching explanations, local code style, and the project's voice rules. Use the maintainer's short Title Case headings. |
| writing-clearly-and-concisely ([softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit/tree/main/skills/writing-clearly-and-concisely); user-level install) | Paragraph development, concrete wording, parallel structure, and concision. | Treat historical usage advice and the AI-pattern catalog as editorial aids. Do not infer authorship from wording. |
| [unslop](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md) | A compact final scan for filler, inflated language, repetitive framing, and over-compression. | Apply project punctuation rules, retain Title Case headings, and protect meaningful technical terminology. Much of this overlaps the existing prose checks. |
| [better-accessibility](https://github.com/jakubkrehel/skills/blob/main/skills/better-accessibility/SKILL.md) | Content structure, image descriptions, accessible names, and checks of affected rendered interactions. | Review the selected content and relevant components; broader interface work needs an appropriate task scope. |
| better-typography ([jakubkrehel/skills](https://github.com/jakubkrehel/skills/tree/main/skills/better-typography); user-level install) | Rendered readability, text hierarchy, line length, wrapping, and truncation. | Use when reviewing presentation. Apply design recommendations in context, with browser verification. |
| [better-writing](https://github.com/jakubkrehel/skills/blob/main/skills/better-writing/SKILL.md) | Optional review of buttons, labels, search messages, and other interface copy. | Use when the selected section includes interface text. |
| [humanizer](https://github.com/blader/humanizer) (MIT, version 3.1.0) | Source of most of the AI-pattern catalogue and the editing workflow above. | Its sentence-case headings and dash-matching rules do not apply. |
| [humanize-writing](https://github.com/jpeggdev/humanize-writing) | Ideas for rhythm, transitions and filler checks, paraphrased above. No license is stated, so nothing is copied from it. | Its "add human texture" pass (opinions, humor, first person, fragments) does not apply. |
| [writing-beats](https://skills.sh/mattpocock/skills/writing-beats) (mattpocock/skills) | The grounding idea behind the first Flow rule: a concept is introduced before a later passage uses it. | It is an article-drafting workflow; only the grounding rule is used. |

The first, second, and fifth skills are installed at user level (`~/.claude/skills/`) on the maintainer's machines, not in this repository; a session without them can still follow this guide. The other skills were inspected at their source repositories on the dates noted and are not installed; this guide carries the rules GarageDocs uses from them. This guide adds no global skill configuration.

## Java Code Style

All Java written or revised for GarageDocs follows the **AdvantageKit Spotless Profile**, named for the AdvantageKit template configuration inherited by Cobra2026. The canonical student-facing reference is Java Code Style (`src/content/java/java-basics/java-code-style.mdx`); the repository's `docs/documentation-style.md`, `docs/content-authoring.md`, and `CLAUDE.md` summarize the authoring requirements.

Use the Spotless and Google Java Format layout defined by Cobra2026. The automated profile formats Java, removes unused imports, trims trailing whitespace, and ensures a final newline. It also permits bounded `spotless:off` and `spotless:on` regions. Do not reproduce layout rules from memory or manually align code against the formatter.

Formatting does not replace technical review. Authors remain responsible for descriptive names, explicit visibility in curriculum examples, useful comments, units and coordinate frames, focused responsibilities, compiling examples, expected output, and version compatibility. Run the Java lesson fence test after editing a Java fence. When editing robot-project source, run that project's Spotless tasks and treat its `build.gradle` as the executable authority.

The name refers to the profile's origin, not to a claim that Spotless checks AdvantageKit APIs or program behavior. Cite Cobra2026's current configuration when documenting exact active rules, and identify inherited formatter versions when a build file does not pin them.

## Mathematical Notation

Use Fira Math for mathematical notation, Fira Sans for explanatory prose, and Fira Code for literal Java and other code. GarageDocs authors equations in LaTeX through its shared `Equation` MDX component; Temml renders semantic MathML at build time. Do not introduce Astro Typst or a second equation renderer for individual lessons. Follow `docs/math-notation.md` for inline, display, and table syntax.

Define symbols and units near their first use. Explain what each equation means and map symbols to code identifiers where they differ. Use proper fractions, roots, matrices, derivative notation, and integral limits rather than ASCII approximations. Keep executable code and expected console output unchanged during typography work. Distinguish continuous mathematics from sampled approximations, especially when teaching PID.

Verify equation rendering in the browser as well as the build. Check font loading, light and dark themes, table cells, and narrow-screen overflow. Invalid LaTeX must fail visibly during the build. Mathematical accessibility also requires explanatory prose; semantic MathML alone is not a claim of complete screen-reader support.

## Accuracy

The prose skills need a GarageDocs-specific review of evidence and teaching dependencies:

1. Read the selected pages and the directly related lessons, exercises, and badge requirements. Confirm that tasks assess material students have been taught.
2. Check technical claims against official documentation, the applicable release, and the relevant project code. Verify actual generated templates when a lesson describes template behavior.
3. Compare code with prose, including names, inputs, expected outputs, units, coordinate frames, versions, and hardware assumptions. Identify runnable examples and partial snippets accurately.
4. Verify that citations support their claims. Check navigation and further-reading links as well as citation links. A responding URL establishes availability, not factual support.
5. Record differences between team references and curriculum choices. Preserve documented intentional choices; flag unresolved conflicts.
6. Report what could not be checked and why. Distinguish source inspection, compilation, simulation, and hardware testing.

## Review and Editing

Read the selected material in full; use searches to find candidates for review without treating search hits as automatic defects. When the maintainer supplies pages as a voice reference, read them for that purpose and update the guide without treating the reference selection as a request to rewrite those pages.

Within a requested cleanup, the maintainer authorizes moving paragraphs, splitting sections, and adding explanations where the teaching is unclear. Make these changes when they improve the learning sequence or comprehension, while preserving technical meaning, requirements, and useful depth. Support new technical claims with sources. Distinguish explanatory additions from changes to curriculum requirements, hardware assumptions, or unresolved technical decisions.

For a review-only request, present findings and proposed edits. For an authorized cleanup, summarize substantial findings before editing and proceed with wording and structural improvements without requesting separate permission for each change. Ask only about unresolved decisions that materially affect correctness, intent, or scope; continue independent work while those decisions are pending.

Report shared issues first, followed by page-specific findings. For each substantive finding, give the location, original wording, proposed or applied change, reason, and supporting evidence where relevant. Use **A** for meaning or accuracy, **B** for ambiguity, and **C** for polish. Identify moved material, split sections, and added explanations in the change summary. Include a brief statement of coverage and anything unverified.

Apply the authorized edits while preserving unrelated changes. Check the affected pages in context, verify the build and internal links, and check sources when citations change. Repeat focused searches for retired names or wording. Summarize the changes and actual verification results.

## Agreed Decisions

- Keep the existing mentor voice and instructional depth.
- Use flexible sentence lengths and page structures, guided by comprehension.
- Move paragraphs, split sections, and add needed explanations within authorized cleanup work.
- Use short, clear Title Case headings with the agreed lowercase minor words and repair affected heading links.
- Preserve the existing badge voice and punctuation exceptions.
- Use the maintainer's Badge 1 pages as the concrete voice reference, with the distinctions above.
- Add focused filler and accessibility checks; use interface-writing and typography checks when the selected work needs them.
- Retain technical verification and consistency across linked curriculum pages as part of every full section review.
- This guide outranks `docs/documentation-style.md` (2026-10-20).
- This repository file is the definitive guide; the vault's `Mentor Voice Prose Guide.md` is the September original and is not maintained (2026-10-20).
- Badge pages follow the Badge Pages rules above, and every edit pass uses the AI-pattern catalogue and editing workflow (2026-10-20).
