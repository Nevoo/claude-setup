---
name: prompt-master
description: Design or refine prompts for AI systems — task prompts for agents/workers, system prompts, and recurring instructions. Use when the user asks to "create a prompt", "write a prompt", "design a prompt", "refine a prompt", "improve a prompt", "generate a system prompt", "build a custom prompt", or wants help instructing an agent. Differentiator: research briefs → research-prompt skill; review prompts → neutral-review skill; this covers every other prompt.
version: 2.0.0
---

# Prompt Master

Goal: produce prompts a blank-context executor can run without asking anything and without silently guessing anything that matters.

## Step 0 — what kind of prompt?

- **Task delegation** — one-shot job for an agent, worker lane, or AI tool. Most common.
- **System prompt / persona** — persistent role for an app, bot, or custom agent.
- **Recurring instruction** — CLAUDE.md rule, skill body, hook text.

Route away first: research brief → `research-prompt`. Review prompt → `neutral-review`.

If the user hands over a near-complete prompt, skip drafting and go straight to Refinement mode below.

## Core principles (all types)

1. **The executor knows nothing.** No shared context survives the handoff — no conversation history, no vault layout, no "the usual format". Test every draft cold: could a competent stranger execute this? Most prompt failures are unstated assumptions, not bad wording.
2. **Define done as something checkable.** State the deliverable's exact shape and a test the executor can run on its own output. Vague deliverables return vague results.
3. **Pre-decide ambiguity.** The executor can't ask questions mid-run. For each fork it might hit, state the rule: "if X, do Y; if unclear, prefer Z; if blocked, report instead of improvising." An agent without a rule invents one — usually the wrong one.
4. **Constraints are rules with reasons.** "Be careful" does nothing; "read-only — do not edit any file" does. Prefer positive instructions over prohibition lists, and attach a short "because" so the executor can generalize to cases not enumerated.
5. **One lane, one job.** Three loosely related tasks in one prompt means the weakest gets leftover attention. Split into parallel prompts instead.
6. **Examples beat adjectives.** One pasted sample of the target output does more than a paragraph of description. Same for formats: show the block, don't describe it.
7. **Match strictness to fragility.** Outcome-only when many approaches are valid; exact steps when deviation is costly. Don't micromanage capable models — over-steered prompts satisfy the rules and miss the goal.
8. **Order: objective → context → constraints → output format.** One-sentence objective first; format last, so it's freshest when the executor writes its final message.

## Checklists by type

### Task delegation
- [ ] One-sentence objective up front
- [ ] All context embedded: paths, names, dates, definitions
- [ ] Ambiguity pre-decisions for every likely fork
- [ ] Explicit constraints (read-only? scope boundary? result cap?)
- [ ] Output format + a "done" test the executor can self-check
- [ ] Leader/worker lanes additionally: a provable finish line ("paste the output", "file exists at path") and a required `Deviations` section (trigger, choice, why — or "Deviations: none")

### System prompt / persona
- [ ] Role and job in the first two sentences — what it's FOR, not just what it is
- [ ] Boundaries: what it must refuse or never do, with reasons
- [ ] Failure behavior chosen explicitly: when uncertain / missing data / out of scope → disclaim, ask, or stop (pick one, say which)
- [ ] Tone shown by one sample exchange, not adjectives
- [ ] Default output format

### Recurring instruction (CLAUDE.md / skill / hook)
- [ ] Trigger condition explicit: when it applies AND when it doesn't
- [ ] Differentiator vs neighboring rules and skills (prevents routing conflicts)
- [ ] Shortest wording that survives a cold read; cut rationale that doesn't change behavior
- [ ] For skills: the description routes, the body executes — get both right independently (see `effective-agent-skills`)

## Refinement mode

Given an existing prompt: run the cold-read test against the matching checklist. For each gap, quote the passage and state what a blank-context executor would do wrong there — concrete misbehavior, not style notes. Then rewrite. If the prompt is already sound, say so and change nothing; refinement has no quota.

## Example

Weak: "Review the new wiki articles and make sure they're good."

Strong: "Read the 3 files listed below in `Wiki/`. For each, check: (1) every external claim cites a `[[source]]`; (2) frontmatter matches `_templates/schema.md`; (3) no personal observation reads as objective fact. Do not edit anything. Return per file: PASS, or the failing check with file:line. Deviations: none expected; log any."

Every added line removes a decision the executor would otherwise make silently. Tokens are cheap; silent wrong guesses are expensive.
