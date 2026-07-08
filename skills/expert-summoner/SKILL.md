---
name: expert-summoner
description: "Builds a temporary expert panel for a domain-anchored problem. Selects 3-6 experts whose published work maps to the user's exact situation, applies each one's methodology in parallel, and synthesizes one verdict. Grounds in Mensor MCP material when available; otherwise reconstructs frameworks from training-data recall with explicit labels. Triggers: 'summon experts', 'who should I ask about', 'expert panel on', 'what does [named expert] say about'. Skips: factual questions, premortems, fixed-perspective panels."
---

# Expert Summoner

## Overview

Builds a temporary expert panel for a domain-anchored problem. The goal is not brainstorming. The goal is to identify people whose actual published work maps to the user's exact situation, apply each framework independently, and synthesize one recommendation grounded in real methodology rather than generic advisor-LLM output.

## When to Use

Fire on signals that the user wants domain expertise, not general advice:
- "summon experts on X"
- "who should I ask about X"
- "what does [named person] say about X"
- "what would the consensus of experts be on X"

Skip on:
- Simple factual questions
- Personal preference questions
- Generic "what should I do" without a domain anchor
- Premortem / failure-analysis requests
- Fixed-perspective panels (LLM Council uses fixed thinking styles, not problem-specific experts)

If unclear, ask once whether the user wants experts summoned. Don't auto-fire on every advice-flavored sentence.

## Inputs Needed

Confirm three things before summoning:
1. The problem itself
2. Relevant context: stage, constraints, what they've tried
3. What a useful answer looks like

Scan the conversation and any CLAUDE.md / memory files first. If something is missing, ask one focused question. Don't interrogate.

## Expert Selection Rules

Pick 3 to 6 experts. Each must:
1. Have spent significant career on this exact area
2. Have a specific named methodology, not general wisdom
3. Be widely recognized: books, results, citations

Mandatory: at least one expert the user is unlikely to know. The skill's main value is surfacing experts they didn't know to ask about.

If the user named a specific expert, include them.

## Grounding and Mensor Retrieval

For each selected expert, check Mensor for coverage. Use whichever Mensor MCP tools are exposed in the current environment. If Mensor is unavailable, proceed without it. The skill must work in either mode.

Inject Mensor material into an expert's analysis only when:
- The user explicitly named that expert, or
- Retrieval returned content directly applicable to the user's specific problem

If retrieval is tangential or absent, run the expert ungrounded and label the section accordingly. Forced retrieval produces mediocre context.

If Mensor surfaces a relevant expert who is not on the panel, mention them in a "you might also want to hear from" line at the end. Don't auto-add them mid-panel.

## Parallel Expert Dispatch

Spawn one sub-agent per expert, in parallel. Sequential dispatch lets earlier responses leak into later ones and defeats the point of independent lenses.

Framing matters. Apply the expert's methodology, don't impersonate the person. The credibility comes from real framework application, not character roleplay.

Sub-agent prompt template:

```
Apply [EXPERT NAME]'s published methodology to the problem below. Reference their actual frameworks, books, and concepts. Do not roleplay the person.

Most relevant framework: [framework summary]

Source material (if any):
[Paste Mensor chunks with IDs, or note "no source material available; reconstruct from training-data recall and flag uncertain claims".]

The user's problem:
[full context]

Produce:
1. DIAGNOSIS: what most people miss here, through this framework (2-3 sentences)
2. FRAMEWORK APPLIED: walk through the methodology against their situation (3-5 sentences)
3. RECOMMENDATION: one concrete action they can take this week (2-3 sentences)
4. COMMON MISTAKE: what people typically get wrong here (1-2 sentences)

Cap: 600 words. Open the section with one grounding tag: [Mensor-grounded] or [Reconstructed]. Within the section, flag individual claims only when uncertain or contested.
```

## Synthesis Format

Read every expert output. Produce one synthesis report.

**EXPERT PANEL REPORT**

1. **The Panel.** Each expert, one line on their diagnosis, with grounding status.
2. **Where Experts Agree.** Convergent points reached through different frameworks. High-confidence signal.
3. **Where Experts Clash.** Real disagreement, preserved. The clash often names the actual tradeoff.
4. **The Verdict.** One clear recommendation. Not "it depends." If the answer genuinely depends on a tradeoff, name the tradeoff and pick a default.
5. **Who to Study Next.** 1 to 2 experts plus their most relevant book or framework. The lasting value of the session.

If an expert was dropped (Mensor returned nothing usable AND training-data reconstruction couldn't produce a confident framework), say so plainly: "we tried to summon X but couldn't reconstruct their methodology with confidence and proceeded without them."

## Epistemic Labeling

Two levels only:

1. **Section-level tag.** Each expert's analysis opens with `[Mensor-grounded]` or `[Reconstructed]`. This is the default signal of confidence.
2. **Claim-level tag.** Apply only to claims that are uncertain or contested within an otherwise grounded section. Don't tag every line. Noise defeats the purpose.

The user must always know whether they're hearing from real source material or from training-data recall, but shouldn't have to wade through inline citations on every sentence.

## Common Pitfalls

- Sequential dispatch instead of parallel. Each expert leaks into the next.
- Skipping the non-obvious expert. That's where the value lives.
- Inventing frameworks. If one can't be cited, label the section reconstructed and flag low confidence.
- Generating HTML reports or visual artifacts. Chat output is the product.
- Triggering on every advice-flavored question. Conservative firing.
- Adding a critic / refinement layer. Resist until v1 produces observable failure modes.
- Forcing Mensor retrieval. Opt-in based on relevance, not availability.
- Smoothing over disagreement to produce a clean verdict. Real clashes are signal.
- Impersonation framing ("you are Hormozi"). Apply the methodology, don't roleplay the person.
- Tagging every claim. Section-level labels plus uncertainty flags only.

## Verification Checklist

Before returning the synthesis, confirm:

- [ ] Problem, context, and desired output are known
- [ ] 3 to 6 experts selected, each with real domain fit
- [ ] At least one non-obvious expert included
- [ ] Mensor checked or explicitly noted as unavailable
- [ ] Experts dispatched in parallel
- [ ] Grounded / reconstructed labels applied at section level
- [ ] Synthesis preserves real disagreement where it exists
- [ ] Final answer gives one verdict, not a menu

## v2 Candidates (Not For Now)

Build only after v1 reveals specific failure modes in practice:
- Asymmetric single-purpose critics: grounding, specificity, framework fidelity, redundancy
- Drop-on-fatal-flag orchestration: pull confabulated experts before synthesis
- Mensor surfacing of non-paneled experts as expansion suggestions
- Persistence of past panels for cross-session pattern recognition

Resist building these on the whiteboard. Add only when v1 fails in their specific direction.
