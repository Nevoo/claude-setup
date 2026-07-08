---
name: research-prompt
description: Write a single-paragraph research brief to hand to a researcher (human, deep-research AI, or worker-researcher lane). Use when the user wants a research brief, a "deep research prompt", a one-paragraph task for a researcher, or asks "what should our researcher look for" — whether the topic is factual fact-finding, a craft/practice question ("how do good X do Y"), or a domain baseline for a coding project. Produces ONE tight paragraph with full context, numbered sub-questions, and per-finding output format.
---

# Research Prompt

Goal: turn a vague research need into ONE self-contained paragraph that a researcher with zero prior knowledge of the project can act on with zero back-and-forth.

## Step 0 — pick the shape

The evidence standard changes with the question type. Misclassifying is the main failure mode: fact-checking machinery kills craft knowledge, and craft framing lets factual claims go unverified.

| Shape | The question really is | Evidence standard |
|---|---|---|
| **Factual / decision** | "What is true, so I can decide X?" | Primary sources, corroboration, citable facts only |
| **Craft / consensus** | "What do good practitioners do, and how widely agreed is it?" | Attribution + consensus rating; practitioner sources outrank academic |
| **Domain baseline** | "How does this domain work, so I can build v1?" | Domain model + terms of art + reference implementations; mixed standard |

A question that mixes shapes (e.g. "film simulation": physics = factual, implementation choices = craft) gets the domain-baseline treatment or splits into separate briefs. One mission per prompt.

## Universal rules (all shapes)

- **One paragraph.** No headers, no bullet list in the deliverable.
- **Prompt the job, not the topic.** Give search handles (timeframe, ranking, source type, decision logic) — not just a subject.
- **Assume zero prior knowledge.** Open by explaining, in plain English, what the project/product is, why it exists, and the current situation.
- **Lead with the goal + decision.** State the single question the research must answer and the decision/use it informs.
- **State priors.** What we already believe going in — and instruct the researcher to attack those beliefs if the evidence disagrees. Without that license, research drifts toward confirming the framing.
- **Embed all context.** Names, dates, product, prior known facts, constraints. The researcher must not need to ask anything or guess.
- **Number the sub-questions inline** (1, 2, 3…). Keep to 3–6.
- **Scout pass for unfamiliar terrain.** If we don't know the field's vocabulary, either run a cheap scouting round first (terms of art, canon, main camps — nothing else) and write the real brief with that vocabulary, or make sub-question 1 "establish the terms of art" and require the report to list search terms for a deeper round. Lay phrasing searches badly ("film simulation" finds camera settings, not emulation algorithms).
- **Negative space.** Require a section on what was searched for and NOT found — otherwise "no evidence exists" and "didn't look" are indistinguishable.
- **For AI researchers: label recall.** Any claim from model memory rather than a fetched source must be marked "unverified recall".
- **Constrain output hard, method loosely.** Be strict on the deliverable; leave the search path flexible.
- **Last sentence:** instruct them to output everything into a single detailed markdown file.

## Shape rules

### Factual / decision
- **Source hierarchy.** Prefer primary sources (official docs, GitHub, papers, filings, changelogs); forums/X/Reddit are weak signal only, never factual proof.
- **Contradiction handling.** If sources conflict, separate confirmed facts / inference / unresolved uncertainty — don't force fake consensus. Flag low-confidence claims for verification.
- **Completion bar.** Corroborate each key claim with multiple independent primary sources where they exist; where sources are scarce, say so explicitly instead of padding.
- **Gap round.** Final self-critique pass: list gaps, contradictions, single-source claims; run another search round to close them; repeat until clean.
- Verifiable, citable facts only. No opinions.

### Craft / consensus
- The unit of finding is the **principle**, not the fact. Verification becomes provenance: who holds this view, how widely?
- Per principle require: **attribution** (who says it, where) + a **consensus rating** — universal (everyone teaches it) / majority / contested (name the camps and their reasoning) / idiosyncratic (one voice, but interesting).
- **Worked example required.** A principle without a concrete example gets dropped.
- **Inverted source hierarchy.** Practitioner sources (blogs, conference talks, postmortems, forum answers by named practitioners) outrank academic ones.
- **Contested items are deliverables, not failures.** Never let disagreement get averaged into fake consensus or reported as "inconclusive".
- Also demand: the canon (books, talks, people the field treats as authorities).

### Domain baseline
- Deliverables: (1) the domain model — how the real thing works, core math/mechanics, sourced; (2) glossary of terms of art; (3) existing implementations — repos, papers, articles, each with link + one-line take on its approach; (4) main implementation strategies and their tradeoffs; (5) available reference data/assets; (6) a suggested minimal v1 and what it deliberately skips.
- **Sweep GitHub and academic papers as separate angles** from general web search — reference implementations are the highest-value artifact and general search buries them.
- **Split standard:** claims about how the real thing works follow the factual rules; build-guidance follows the craft rules (attribute it, note disagreement).
- Done-test: "could we sketch v1's architecture without another search?"

## Process

1. Pick the shape. If genuinely ambiguous, ask one question; otherwise decide and say which you picked.
2. Pull context from project files / conversation; write the 1–2 sentence zero-knowledge explainer; capture priors.
3. Identify the ONE question the research answers and the decision it feeds.
4. Draft 3–6 numbered sub-questions using the shape rules.
5. Add include/avoid constraints + the per-finding output format.
6. Compress to one clean paragraph. Cut filler.

## Templates

**Factual / decision:**

> [Zero-knowledge explainer: what the project is, why it exists, current situation.] Research [TOPIC + key identifying facts] to answer one question: [THE QUESTION] — for [DECISION / END USE]. We currently believe [PRIORS]; challenge these if the evidence disagrees. Find: (1) …; (2) …; (3) …; (4) …. [Constraints: include X, avoid Y.] Prefer primary sources; treat forums/social as weak signal only; if sources conflict, separate fact from inference and flag what needs verification. Don't stop at the first plausible answer: corroborate each key claim with multiple independent primary sources where they exist (and say so explicitly where they don't). Before finishing, do a self-critique pass — list gaps, contradictions, and single-source claims, then run another round of searches to close them, repeating until clean. Also report what you searched for and did not find. For each point: source link, the specific claim, and a one-line "why it matters". No marketing fluff — verifiable, citable facts only. Output everything into a single detailed markdown file.

**Craft / consensus:**

> [Zero-knowledge explainer.] Research how experienced [PRACTITIONERS] approach [TOPIC] to answer one question: [THE QUESTION] — for [END USE]. We currently believe [PRIORS]; challenge these if practitioner consensus disagrees. Find: (1) the principles practitioners actually teach and use; (2) for each, who says it and where, a consensus rating — universal / majority / contested (name the camps and their reasoning) / idiosyncratic — and one concrete worked example (no example, no entry); (3) the canon: the books, talks, and people the field treats as authorities; (4) the terms of art needed for a deeper round. Prioritize practitioner sources (blogs, talks, postmortems, named-practitioner forum answers) over academic ones. Contested points are findings, not failures — never average disagreement into fake consensus. Also report what you looked for and didn't find. For each entry: source link, the principle, the consensus rating, the example. Output everything into a single detailed markdown file.

**Domain baseline:**

> [Zero-knowledge explainer: we're building X in context Y.] Research [DOMAIN] so we can design v1 of [PROJECT] — done means we could sketch the architecture without another search. Find: (1) how the real thing works — the domain model and core math/mechanics, with primary sources; (2) the terms of art (lay phrasing searches badly — return the vocabulary the field actually uses); (3) existing implementations — open-source repos, papers, articles, each with a link and a one-line take on its approach; (4) the main implementation strategies and their tradeoffs; (5) what reference data or assets exist; (6) a suggested minimal v1 and what it deliberately skips. Sweep GitHub and academic papers as separate angles from general web search. Hold how-it-really-works claims to strict primary sourcing; treat build-guidance as practitioner consensus (attribute it, note disagreement). Label anything recalled from memory rather than fetched as unverified recall. For each point: source link, the finding, and a one-line relevance note. Output everything into a single detailed markdown file.

## Executing the prompt

- **Factual shape** → pass the paragraph as args to the `deep-research` workflow (it is built for exactly this: quote-anchored claim extraction, 3-vote adversarial verification), or hand it to a `worker-researcher` lane.
- **Craft shape** → `worker-researcher` lane, NOT deep-research: that harness extracts only falsifiable claims, ranks practitioner sources as low quality, and reports contested topics as "inconclusive" — all three work against craft questions.
- **Domain baseline** → `worker-researcher`; if firecrawl is connected, instruct it to use `firecrawl_research_search_github` and `firecrawl_research_search_papers` as dedicated angles.
- **Human researcher** → deliver the paragraph as-is.
