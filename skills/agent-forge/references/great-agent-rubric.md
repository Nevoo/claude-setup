# What makes a great agent — the gating rubric

Nine tests. A workflow must clear **1–6** to be build-ready. 7–9 make it durable. Distilled from the arlou knowledge base (Verification-First Agent Engineering, Personal Agent Stacks Need Knowledge and Coordination, Positioning an AI Agent Studio Around Workflows, the AI Agent Roadmap Call Framework).

## Build-ready (must pass all)

1. **Defined "done" before building.** There are written acceptance criteria and a deterministic stop condition. The agent is judged by an external check (a test, a diff, a schema match, a human sign-off), never by output that merely looks plausible. *If you can't state what "correct" means before building, you can't build it yet.*

2. **Bounded scope.** One clear trigger, one clear output, a narrow slice. Not "handle support", but "draft a reply to a refund request and save it as a draft".

3. **Passes the deletion test.** Would the buyer still want this workflow if the word "agent" were removed? If the value only exists because it sounds like AI, it's hype, not a workflow.

4. **Cheap, inspectable state.** The agent can read the state it needs without a chain of discovery calls; context stays small and relevant; each output exposes the next useful move. High token drag and hidden state cause drift.

5. **Human-in-the-loop at consequence points.** Autonomy for preparation, approval for consequences. The agent can draft, research, classify, and stage freely; a human approves anything that sends, pays, deletes, or is customer-visible until accuracy is proven.

6. **Real integration surface.** It runs on the tools and data they already use, with the unglamorous parts handled: permissions, persistence, review state, deployment. The "app wrapper" is most of the value.

## Durable (makes it compound)

7. **Memory and retrieval that compound.** Context survives across runs. The agent retrieves what it needs and knows what capabilities exist instead of improvising from a blank slate.

8. **An ops layer, not a lone bot.** Logging, a job/registry record, monitors, and notifications so work survives handoffs and recurring routines. Without it, "you don't have an agent team, you have a chatbot that learned your name."

9. **A measurable before/after, in money.** A concrete metric, a 30-day "good enough" definition, and where possible a dollar figure from the client's own stated cost (hours/week × loaded hourly rate). The win should be provable and quantified, not felt.

## Red flags (fail the gate)

- "An AI agent for the whole business."
- The workflow changes every time it runs.
- No one can explain the current process step by step.
- All critical knowledge lives in one person's head.
- No clean trigger or no clear output.
- Too politically sensitive to be a safe first win.
- They want full autonomy before basic structure exists.

## Green flags (prioritize)

- Repeats frequently, with a clear trigger and output.
- Existing tools with usable, mostly-structured data.
- Concrete, current, expensive pain.
- A human review step can absorb the risk.
- Success is measurable within 30 days.

## Fast scoring (1–5 each; risk is reverse-scored)

frequency · pain level · trigger clarity · output clarity · data availability · integration feasibility · business value · (5 − risk)

The best first workflow usually scores high on frequency, pain, and clarity, medium-to-high on value, and manageable on risk. A high score with a failed gate test still fails — the gate is a veto, not an average.
