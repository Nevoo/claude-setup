# agent-forge — self-run on arlou (3 cases)

Run in self mode. Questions answered from the arlou vault + live context. Three different business functions: marketing, delivery, product. Demonstrates the gate (none were rejected here because all three were chosen to be strong; the rubric still vetoes the weak parts inside each).

---

## Case A — Operator Brief (marketing / top-of-funnel)

**Interrogation (compressed):**
- *Where does arlou's week leak that's also growth-critical?* → Top-of-funnel content. The whole funnel is content → site → roadmap, so content IS the engine, and it's manual and inconsistent (skipped on busy/travel days).
- *Concrete workflow?* → Daily: scan AI news, find an operator's angle (not a commentator's), draft a LinkedIn post in Rouven's voice, post.
- *Trigger / data / tools?* → 07:00 cron. AI news (Firecrawl/feeds/X), the vault (voice-dna, past posts, wiki content angles), LinkedIn. Mostly retrievable.
- *What must a human still own?* → The post before it publishes. Autonomy for drafting, approval for publishing.
- *Deletion test:* "a daily operator-angle draft on today's AI news, in my voice, ready to approve" wanted even without "agent"? Yes.

**Score (1–5):** frequency 5 · pain 4 · trigger 5 · output 4 · data 4 · integration 3 (LinkedIn API; mitigate by staging not auto-posting) · value 4 · (5−risk) 4. → **Gate: PASS** (1–6 pass; 7 vault memory, 8 draft log, 9 cadence metric).

```
# Agent Blueprint — Operator Brief
Subject:   arlou
Function:  marketing
One-liner: Each morning, turns the day's most relevant AI news into one LinkedIn post
           draft in Rouven's voice, staged for a one-tap approve-and-post.

## Workflow
Trigger:   daily 07:00 cron
Steps:     1. pull last 24h AI news (Firecrawl search + trusted feeds/X)
           2. rank by operator-relevance (does Rouven have a real take; ties to
              agents/workflows/building)
           3. pick 1
           4. retrieve voice-dna + 2–3 past high-performers + matching wiki angle
           5. draft (hook + operator POV + soft CTA), enforce voice rules
              (short paras, no em dash, no clichés)
           6. stage as draft with source link + a "why this angle" note
People:    Rouven reviews/edits/approves
Tools:     Firecrawl/RSS, Obsidian vault (read), drafts store, LinkedIn (post on approval)
Inputs:    news (messy), vault (structured-ish)
Outputs:   one staged draft/day
Frequency: daily

## The contract (proof of done)
Acceptance: >=60% of drafts approved with light-or-no edit over a 2-week window
Stop:       one approved-or-rejected draft per day; never auto-publishes
HITL:       approval before anything posts (hard rule: never auto-post)
Failure:    tone-deaf angle in a sensitive news cycle (sensitivity check + always
            human-gated); voice drift (voice-dna in context + log rejects)

## Value
Before:    inconsistent posting, skipped when busy/travelling
After:     a ready draft every morning; posting becomes a 2-minute decision
Metric:    posts published/week (sporadic -> 5/week) + 30-day impression trend
30-day:    a daily draft he approves more often than not

## Build defaults
Model: Sonnet draft, Haiku news-rank · Trigger: cron · State: Postgres
(news picked, draft, approved?, edits) · Alerts: Telegram "draft ready" · serverless

## Rubric check
1 done: approved-rate defined  2 bounded: one post/day  3 deletion: pass
4 inspectable: news+vault in context  5 HITL: approve-before-publish  6 integration: real

## Risks / not yet
No auto-post. No engagement-bait chasing. No multi-platform until LinkedIn cadence proven.
```

---

## Case B — Roadmap Scribe (delivery / ops) — dogfoods the skill

**Interrogation:**
- *Where's the delivery risk in the $999 roadmap?* → The 48-hour turnaround on a structured deliverable. Manual synthesis after every call; must feel premium and fast; a time sink and consistency risk as volume grows.
- *Concrete workflow?* → Trigger: call ends, transcript available. Produce: business summary, top 3 scored workflows, strongest candidate as a blueprint, what-not-to-automate, 30-day criteria. Using the Roadmap Call Framework + this rubric.
- *Data/tools?* → Transcript (Fathom/Zoom), the framework+rubric+template files, optional company-site fetch. Structured enough.
- *HITL?* → Rouven reviews and signs before the client sees it.
- *Deletion test:* "a scored roadmap drafted from my call transcript in minutes" wanted without "agent"? Absolutely.

**Score:** frequency 3 (per call, grows) · pain 4 · trigger 5 · output 5 (fixed template) · data 4 · integration 4 · value 5 (protects core promise + scales delivery) · (5−risk) 4. → **Gate: PASS.**

```
# Agent Blueprint — Roadmap Scribe
Subject:   arlou
Function:  delivery
One-liner: Turns a roadmap-call transcript into the full scored roadmap deliverable,
           drafted for Rouven to review and send inside the 48-hour promise.

## Workflow
Trigger:   new transcript lands (recorder webhook) or manual "process this call"
Steps:     1. ingest transcript
           2. extract per the 7-part framework (business, pain, candidates, data reality)
           3. score each candidate on the 8-dim rubric
           4. pick strongest; draft an Agent Blueprint for it
           5. write business summary + what-not-to-automate + 30-day criteria
           6. assemble into the deliverable template; flag gaps the call didn't cover
People:    Rouven reviews/edits/sends
Tools:     transcript source, agent-forge framework/rubric/blueprint files,
           deliverable doc template, optional company-site fetch
Inputs:    transcript (messy) + frameworks (structured)
Outputs:   near-final deliverable doc + a gaps list
Frequency: per roadmap call

## The contract (proof of done)
Acceptance: Rouven approves with < ~20 min of edits AND every claimed workflow has a
            filled blueprint contract AND gaps are flagged, never invented
Stop:       one assembled draft + gaps list per call; never sends to client
HITL:       Rouven signs before the client sees it (hard rule: never auto-send)
Failure:    hallucinating uncovered details (use gaps-list + "unknown", don't guess);
            over-promising automatability (the rubric gate guards this)

## Value
Before:    hours of manual synthesis per call; consistency varies; 48h pressure
After:     a draft in minutes; review-and-send
Metric:    call-to-deliverable time + edit-effort per deliverable
30-day:    one real call turned into a deliverable he sends after a light edit

## Build defaults
Model: Sonnet · Trigger: webhook/manual · State: Postgres (transcript ref, scores,
draft, edit delta) · Alerts: Slack "deliverable drafted" · serverless

## Rubric check
1 done: edit-effort + filled contracts  2 bounded: one deliverable/call  3 deletion: pass
4 inspectable: transcript+frameworks  5 HITL: sign-before-send  6 integration: real

## Risks / not yet
No auto-send. No score inflation to please. Human stays the signer.
```

---

## Case C — Weekly Pulse (product / growth) — also the public showcase

**Interrogation:**
- *Highest-leverage recurring decision made by hand?* → MensorAI growth: weekly "what moved, what to do". Today ad-hoc dashboard staring; decisions don't compound.
- *Concrete workflow?* → Weekly: pull PostHog (funnel, WoW users, auth_failures, extension funnel) + GSC (impressions/CTR/queries), find the 2–3 signals that matter, write a business-readable brief with ONE recommended action, prepare that action's artifact, carry state to next week.
- *Data/tools?* → PostHog API/MCP, GSC API, a weekly-state store. Structured. (PostHog/MensorAI access exists live.)
- *HITL?* → Rouven approves the action + artifact before anything ships.
- *Deletion test:* "a weekly one-decision brief on MensorAI with the artifact pre-built" wanted without "agent"? Yes.

**Score:** frequency 4 · pain 3 (skippable but compounding) · trigger 5 · output 4 · data 5 (APIs exist) · integration 4 · value 4 (+ doubles as the website proof object) · (5−risk) 5. → **Gate: PASS.**

```
# Agent Blueprint — Weekly Pulse
Subject:   MensorAI (arlou's proof object)
Function:  product / growth (doubles as arlou's public showcase)
One-liner: Every Monday, reads MensorAI's PostHog + Search Console, surfaces the few
           signals that matter, and hands Rouven one recommended action with the
           artifact already prepared.

## Workflow
Trigger:   weekly Monday 08:00 cron
Steps:     1. pull last 7d + WoW PostHog (key funnel + anomalies like auth_failure
              spikes) and GSC (impressions, CTR, top movers)
           2. diff against last week's stored state
           3. select the 2–3 signals that actually matter
           4. write a decision card: what happened, why it matters, ONE action
           5. prepare the artifact for that action (e.g. a new meta description for a
              high-impression low-CTR page; a copy tweak; an event to add)
           6. store this week's state for next week's diff
People:    Rouven approves action + artifact
Tools:     PostHog API/MCP, GSC API, weekly-state table, the surface the artifact applies to
Inputs:    analytics (structured)
Outputs:   one decision card + one staged artifact + carried state
Frequency: weekly

## The contract (proof of done)
Acceptance: the recommended action is specific and shippable (not "improve SEO" but
            "replace /x meta description with this string"), cites real numbers from
            this week's pull, and the artifact is ready to apply as-is
Stop:       one decision card + one prepared artifact per week; never applies the change
HITL:       Rouven approves before any change ships (hard rule: stages, never deploys)
Failure:    drowning in metrics (hard cap: 3 signals, 1 action); vanity actions
            (tie every rec to a funnel/revenue-relevant signal)

## Value
Before:    ad-hoc dashboard checks; decisions don't compound week to week
After:     one decision a week, prepared, with memory
Metric:    weekly recommended-action adoption + the funnel/CTR metric it targets
30-day:    4 weekly briefs, each with one action Rouven actually ships

## Build defaults
Model: Sonnet synthesis · Trigger: cron · State: Postgres (weekly snapshot + state)
· Alerts: Telegram "pulse ready" · serverless. (PostHog access already exists.)

## Rubric check
1 done: specific shippable action  2 bounded: one decision/week  3 deletion: pass
4 inspectable: analytics APIs  5 HITL: approve-before-ship  6 integration: real

## Risks / not yet
No auto-apply. No extra data sources before the one-action discipline holds.
Don't expand beyond MensorAI until the loop proves itself.
```

---

## What the run revealed

All three collapsed to the same skeleton: **trigger → retrieve → reason (Sonnet) → stage an artifact → human approves before consequence → log state.** Two of them ("draft-and-stage", "weekly-brief") are the same templated type. That repetition is the extraction signal for the v2 factory — and it showed up after exactly 3 blueprints, which is the rule. It also confirms the rubric's spine: every strong case had a definable "done" and a human gate on consequence. The weak ideas (auto-posting, auto-applying changes, auto-sending to clients) were the exact things the gate forced into human-in-the-loop.
