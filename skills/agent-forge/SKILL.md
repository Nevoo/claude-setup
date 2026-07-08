---
name: agent-forge
description: Interrogate a business one question at a time, then forge a build-ready spec for one bounded AI agent. Use when the user wants to design an AI agent, run an "AI agent roadmap", decide which workflow to automate first, get grilled on automation opportunities, scope an agent build, or dogfood arlou's roadmap call. Works on a client's business or on the user's own (arlou).
---

# agent-forge

Turn vague "we should use AI somewhere" into one bounded, build-ready agent spec. This skill grills the business, scores the candidate workflows, refuses the bad ones, and emits a blueprint with a defined proof of "done". It is the opposite of agent hype: nothing is called build-ready until it can be verified.

## Two modes, one engine

- **Client mode** — run during or after a roadmap call to interrogate a client's business and produce the roadmap deliverable plus a first blueprint.
- **Self mode** — run on arlou (or any of your own products) to design your own next agent.

Detect which from context. If unclear, assume the subject is whoever's business is being discussed.

**Pre-call recon (optional, client mode).** Before a roadmap call, given the prospect's website and industry, list the five workflows most likely eating their team's time and the one to ask about first. Walk in already knowing where to dig.

## Rules of the interrogation

1. **Ask one question at a time.** Wait for the answer before the next. Never dump a questionnaire.
2. **Always offer your recommended answer.** You are a consultant, not a form. After each question give the answer you'd bet on, then let them correct you.
3. **Walk the decision tree.** Resolve dependencies in order. A later question's framing should adapt to earlier answers.
4. **Pull vague answers back to specifics.** When you hear "we use AI for everything" or "it's complicated", ask: "Walk me through the last time this happened." Concrete instance over abstraction, every time.
5. **You may answer your own questions from evidence.** In self mode, or when you have the codebase / vault / analytics, look it up instead of asking.
6. **Refuse early-build pressure.** If they want "one agent for the whole business", slow down and find the one bounded slice.

## The five gates

Move through these in order. Do not skip to Spec.

1. **Context** — business model, who pays, how a lead becomes revenue, where the team's week goes, the recurring workflows that matter. (Find where time and money leak.)
2. **Map** — pick the highest-friction candidate and map it concretely: trigger → steps → people → tools → inputs → outputs → approval points → frequency → failure modes. **Capture the cost numbers here:** who does it, their loaded hourly rate, and hours per week. Without these you cannot compute the ROI the deliverable leads with, so get them or explicitly mark them to confirm.
3. **Reality** — is it buildable? Where the data lives, structured vs. messy text, available APIs/tools, privacy/permission constraints, how much context is undocumented (stuck in a head).
4. **Boundedness gate** — score the candidate (see `references/great-agent-rubric.md`). **Stop here** if it trips a red flag: no clean trigger, no clear output, workflow changes every time, critical knowledge only in one person's head, too politically sensitive for a first win, or "autonomy for the whole business". Say so plainly and either pick a safer slice or recommend not automating yet.
5. **Spec** — only if the gate passes, emit the blueprint.

## The gate rule

A workflow is **not** build-ready until it clears at least tests 1–6 of `references/great-agent-rubric.md` (defined "done", bounded scope, passes the deletion test, inspectable state, human-in-the-loop at consequence points, real integration surface). If it can't define "done" or can't be verified by an external check, it fails the gate no matter how exciting it sounds.

## Outputs

- **Agent Blueprint** — one per build-ready workflow. Use the template in `references/agent-blueprint.md`. The non-negotiable fields are **acceptance criteria** (the proof of done) and **stop condition**.
- **Roadmap deliverable** (client mode) — the client-facing report that sells the build. Follow `references/deliverable-spec.md`: lead with a dollar ROI computed from their own stated numbers, quote their own words back to them, place candidates on an impact-vs-effort view, and recommend a first build arlou can actually deliver. Readable by a non-technical owner on the first pass.
- **Worked example** — `examples/arlou-self-run.md` is a complete self-mode run with real workflows, gate scores, and blueprints. Read it to calibrate gate scoring, or before any arlou self-mode run.

Default build choices when none are given: Claude Sonnet for reasoning (Haiku for cheap high-volume classification), a cron or webhook trigger on infrastructure they already run, Postgres/Supabase for state and logs, Slack for alerts, a human approving anything with external consequences.

## Scope discipline (read this before expanding the skill)

This is v1: interrogate and spec **one** agent. Do not build the factory abstraction (shared ops layer, registry, monitors, templated agent types) until 3+ real blueprints exist and the repeated parts are obvious. The target architecture is sketched in `references/factory-architecture.md` and stays dormant until earned. Building it early is the cathedral-before-the-brick trap this skill exists to prevent.
