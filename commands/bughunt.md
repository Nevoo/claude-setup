---
description: Launch 4-5 parallel investigation agents to diagnose a bug without editing code
argument-hint: <bug description> [extra: <5th hypothesis>]
---

# Parallel Bug Investigation

A bug has been reported. Instead of debugging sequentially, you will launch parallel read-only investigation agents, each pursuing a distinct hypothesis, then synthesize their findings into a single root-cause analysis.

## Bug report

$ARGUMENTS

## Protocol

**Hard rule: do NOT edit code until the user approves the proposed fix plan.** Every agent is read-only. You only edit after explicit approval.

### Step 1 — Parse input

Read the bug description above. If it contains `extra: <hypothesis>`, treat the text after `extra:` as a 5th user-specified hypothesis to investigate alongside the 4 canonical ones. Otherwise, run 4 agents.

### Step 2 — Launch parallel agents

Launch the following agents **in a single message with multiple Agent tool calls** (parallel execution is mandatory — sequential investigation defeats the purpose). Use `subagent_type: "Explore"` for each since it's read-only by design.

Every agent's prompt must include:
- The bug description
- Its specific hypothesis focus (below)
- Output format requirement: **file:line evidence for every claim, ranked hypothesis likelihood (high/medium/low/ruled-out), and a one-paragraph summary**
- Explicit read-only instruction: "Do not edit, write, or modify any files. Report findings only."

**Agent 1 — State / closure / cache**
Investigate whether the bug is caused by stale state, closure captures, cache invalidation, memoization, or reactive/observable misbehavior. Look for stale props, stale refs, missing dependency arrays, cached responses, or state that survives across events that should reset it.

**Agent 2 — API contract / endpoint mismatch**
Investigate whether request/response shapes, endpoint URLs, auth headers, status codes, serialization formats, or API versions are mismatched between caller and callee. Check both client and server sides of the contract if both are in the repo.

**Agent 3 — Lifecycle / initialization ordering**
Investigate whether something runs before its dependencies are ready, fires twice, fails to unmount/dispose, or races with another initialization path. Look at mount/unmount, effect ordering, app startup, route transitions, and async initialization chains.

**Agent 4 — Recent git history**
Review commits over the last ~2 weeks (or since the bug was first observed, if known). Identify changes touching areas related to the bug. Use `git log`, `git show`, and `git blame` to find suspicious recent modifications. Rank which commits most plausibly introduced the regression.

**Agent 5 — User-specified hypothesis** *(only if `extra:` was provided)*
Investigate the specific hypothesis the user flagged. Give this equal rigor — the user's suspicion may be right or wrong, and the job is to either confirm it with evidence or rule it out.

### Step 3 — Synthesize

After all agents return, produce a single consolidated report with these sections:

1. **Ranked root-cause candidates** — merged across agents, with likelihood and the strongest file:line evidence for each
2. **Ruled out** — hypotheses agents confidently eliminated, with brief reasoning
3. **Open questions** — anything an agent flagged as needing more info
4. **Proposed fix plan** — the smallest change that addresses the most likely root cause, naming specific files and what would change

### Step 4 — Stop and wait

Present the report. Do not edit any files. Wait for the user to approve, reject, or redirect the plan.

## Why this exists

Sequential debugging burns iterations when the real cause is in a different layer than the first guess. Parallel hypothesis-testing catches cross-layer bugs (e.g. "it's a cache bug AND an API shape change introduced last Tuesday") in one pass instead of three.
