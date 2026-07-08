---
name: neutral-review
description: Evidence-anchored neutral review of any artifact — documents, plans, specs, schemas, scripts, prompts, skills, emails, architectures. Use when the user asks to "review this", "give feedback on", "critique", "any issues with this", "is this good", and no specialized reviewer fits. Differentiator: content pieces/posts/hooks → content-check; code diffs → code-review; marketing copy → copy-editing; UI → impeccable or web-design-guidelines. This is the fallback review discipline for everything else, and the template for instructing any review agent.
---

# Neutral Review

A review prompt is a demand: "find what's wrong" asserts problems exist, and the reviewer complies by inventing them. This discipline makes "nothing's wrong" a legitimate outcome and forces every finding to survive contact with evidence. Neutrality comes from the structure below, never from telling a reviewer to "be neutral" or "be brutally honest".

Two modes: **run** the review yourself (default), or **emit** the delegation brief for an agent lane (when the user wants a prompt, or the artifact warrants fresh eyes).

## Method

### 1. Establish the rubric
"Is it good?" invites improvised authority. A rubric turns review into applying criteria — reliable even where expert judgment is shaky, because the expertise lives in the rubric.
- User named criteria → use them. 3–7, no more.
- A reference file exists (schema, style guide, spec, template) → derive criteria from it and cite it.
- Neither → bootstrap in a SEPARATE pass (fresh agent, or a clearly separated step): "What do experienced X reviewers check when evaluating a Y, and why does each item matter?" For high stakes, sanity-check the rubric with the user before reviewing. The separation matters: writing the rubric in the same breath as reviewing primes the findings.

### 2. Blind pass before hypothesis
If the user voiced a suspicion ("I think the pacing drags"), park it. Review blind first; afterwards check the hypothesis explicitly and report whether the blind pass independently surfaced it. A leaked hypothesis manufactures confirming findings.

### 3. Review with the skeleton
Per criterion:
- **Quote the evidence.** The exact lines, clause, or element the judgment rests on. A finding that can't point at something real in the artifact gets dropped — hallucinated problems can't cite real evidence.
- **Verdict:** works / fails / can't evaluate. "Can't evaluate" is honesty, not failure — say what's missing to judge it.
- **Failure scenario** for every fail: who or what concretely gets hurt, under what conditions. No scenario → it's a preference, not a finding; label it as such or drop it.
- **Confidence:** certain / likely / speculative.

### 4. Symmetry and calibration
- Name the single strongest and single weakest element — comparative judgment is more reliable than absolute verdicts.
- No quotas, ever. Zero findings is a valid result: say "holds up as written" plainly.
- Don't propose rewrites unless a criterion fails or the user asked for fixes.

### 5. Skeptic pass — high stakes or before shipping
Hand each finding to an independent verifier (the `verifier` agent) with the inverted bias: "Try to refute this finding. Default to refuted if uncertain." Report only survivors; list killed findings one line each for transparency. The finder never grades its own findings — no self-graded homework.

## Output format

1. Verdict sentence first: "holds up as written" or "N findings, worst first".
2. Per finding: evidence quote → what fails → failure scenario → confidence.
3. Strongest and weakest element.
4. Can't-evaluate list: what the review couldn't assess and why.
5. If a skeptic pass ran: survivors vs. killed.

## Delegation brief (emit mode / spawning a review agent)

> Below is [artifact]. Assess it against these criteria: [3–7 criteria]. For each criterion: quote the exact lines your judgment rests on, give a verdict (works / fails / can't evaluate), and for each fail describe the concrete situation where it breaks — who or what gets hurt. Then name the single strongest and single weakest element. Mark every judgment: certain / likely / speculative. If it holds up as written, say so — "no changes needed" is a valid outcome. Do not propose rewrites unless a criterion fails. [Optional, always last and clearly separated: "Separately, evaluate this specific concern: X."]

Keep the user's hypothesis OUT of the main brief; if included at all, it goes in that separated final slot.

## Anti-patterns

- "Find the 10 biggest problems" — a quota forces invention.
- "Be brutally honest / tear this apart" — direction-pushing theater. Structure is the neutrality, adjectives aren't.
- Findings without quotes; fails without failure scenarios.
- One context writing rubric and review in a single pass.
- Reviewing work you authored without a skeptic pass.
- Padding a clean review with "consider also…" suggestions to seem thorough.
