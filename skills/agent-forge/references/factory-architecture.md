# Factory architecture — v2 target (DORMANT)

Do not build this until 3+ real blueprints exist and the repeated parts are obvious from actual builds. Written now only so the target is named. Building it early is the exact mistake the skill warns against.

## What "factory" means

Not one agent. The repeatable machine that turns a blueprint into a running agent and keeps it alive cheaply. The factory's whole reason to exist is to drive down one number: **maintenance-hours per live agent**, the metric that sets a solo operator's client ceiling.

## The layers (extract these only when they repeat)

- **Orchestration + memory** — one layer per client that owns context, priorities, and long-term memory. New needs become new capabilities on the one system, not ten disconnected bots. (Mensor-as-orchestrator in the vault notes.)
- **Execution runtime** — where tools, triggers, cron, and worker coordination actually run.
- **Registry** — a record of active jobs: status, branch/PR, review state, follow-up needed. So work survives handoffs instead of living in a chat log.
- **Monitors** — deterministic, cheap checks on state. They interrupt a human only when a decision, review, or merge is needed.
- **Templated agent types** — the blueprints that recur (triage, extract-to-structured, weekly-brief, draft-and-stage) shipped battle-tested and quiet, so each new client agent is an instance, not a net-new build.
- **Review/approval surface** — the human-in-the-loop layer, centralized: one place to approve everything waiting on a consequence.

## The extraction rule

When you've hand-written the same logging, retry, review-state, or alerting code for the third time, that's the signal to lift it into the factory. Not before. Each layer earns its place by having already been duplicated in real builds.
