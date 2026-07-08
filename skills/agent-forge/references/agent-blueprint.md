# Agent Blueprint — output template

One per build-ready workflow. The two fields in **bold** are non-negotiable; if either can't be filled, the workflow failed the gate.

```
# Agent Blueprint — <short name>

Subject:        <business / product this is for>
Function:       <marketing | sales | delivery | support | ops | product | finance>
One-liner:      <what it does, in plain words, no "agent" jargon>

## Workflow
Trigger:        <what kicks it off, concretely>
Steps:          1. ...  2. ...  3. ...
People:         <who touches it today / who reviews it after>
Tools:          <systems and APIs it reads/writes>
Inputs:         <what it consumes; structured or messy>
Outputs:        <what it produces and where it lands>
Frequency:      <times per day/week/month>

## The contract (proof of done)
**Acceptance criteria:**  <the external check that says "correct" — schema match,
                           human approval rate, test, diff, threshold>
**Stop condition:**       <when the agent is done / when it must hand off>
Human-in-the-loop:        <the exact points a human approves before consequence>
Failure modes:            <what breaks it; what it must refuse to do>

## Value
Before:         <current cost: time/week, error rate, delay>
After:          <target state>
Metric:         <the one number that proves it worked>
30-day "good enough": <the smallest version that's a real win>

## Build defaults
Model:          <Sonnet for reasoning; Haiku for cheap high-volume classification>
Trigger tech:   <cron / webhook / inbox poll>
State:          <Postgres / Supabase table: what gets logged each run>
Alerts:         <Slack channel on error or low-confidence>
Deploy:         <serverless function / small service on existing infra>

## Rubric check
1 done-defined  2 bounded  3 deletion-test  4 inspectable  5 HITL  6 integration
[ pass/fail each, one line ]

## Risks / not yet
<what NOT to automate in this workflow yet, and why>
```
