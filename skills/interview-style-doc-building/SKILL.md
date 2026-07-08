---
name: interview-style-doc-building
description: Use when Rouven wants to build a structured strategic document by answering questions (goals docs, principles, frameworks, ranked lists, weekly/quarterly reviews, positioning docs). Interview one question at a time, patch the file after each answer, then re-ask. Differentiator vs grill-me: grill-me stress-tests an existing plan; this authors a new doc from Rouven's own words. Differentiator vs agent-forge: agent-forge produces an agent spec; this produces any strategic doc.
---

# Interview-Style Doc Building

Preferred mode for creating durable strategic docs. The AI does NOT propose content — the AI asks one question, Rouven answers, the AI patches the file, the AI asks the next question. The file IS the conversation's output, updated incrementally.

## When to use

- Building a new source-of-truth doc (goals, principles, frameworks, ranked lists, positioning).
- Filling out a structured doc Rouven explicitly wants to author himself (e.g. Brand System reviews, Without a Map planning docs).
- Quarterly/annual reviews where Rouven's words go into the file.

**NOT for:** content drafting (use content-check), plan stress-testing (grill-me), or anything where the AI proposes content first.

## The Loop

1. **Create the file** with a skeleton (header, sections, "to be filled in" placeholders). Single Write for the new file. After this, NEVER overwrite — only Edit.
2. **Ask ONE question.** Concise. Specific. Single-faceted. Open-ended where possible.
3. **Wait for the answer.** Don't ask the next question yet.
4. **Patch the file** with the answer in the correct section.
5. **Re-ask** — next question, or follow-up if the answer was incomplete.
6. Repeat until the file is complete.

## Hard Rules

- **One question at a time.** Never dump multiple questions in a single message.
- **Patch, don't overwrite.** After the initial skeleton, use Edit for every update. Never Write to an existing doc.
- **Update the file BEFORE asking the next question.** Order: receive answer → patch file → ask next question. Not the reverse.
- **Lists from Rouven are UNORDERED SETS.** When he lists items in response to "which X should we cover?", that is a SET, not a ranking. Never infer rank, priority, or sequence from the order he typed them. If you need ordering, ask explicitly: "Which of these is #1?"
- **Preserve his words.** Light cleanup only; the doc should sound like him, not like AI summary. Voice DNA applies.
- **No snark, no attitude, no filler.** Concise questions, concise acknowledgments.
- **No speculative additions.** Don't invent sections, edge cases, or "anything else?" prompts unless asked.

## Question Design

- **Domain-discovery, not confirmation.** "What wins against everything else?" — not "Is business #1?"
- **Surface new reality.** Each question should pull out info the AI doesn't already have.
- **Engine-move framing where applicable.** "What's the thing that, if true, makes the rest obvious?"
- **Concrete over abstract.** "What's #2 — the domain that wins against everything except #1?" beats "Tell me about your second priority."

## File Patching Pattern

After each answer:
1. Read the relevant section (if not already in context).
2. Edit with old_string = placeholder or previous entry, new_string = updated content with Rouven's words preserved.
3. Confirm the diff. Move on.

For ranked lists, append one rank at a time; each rank gets patched in as Rouven confirms it.

## Common Pitfalls

- **Assuming order from a set.** He lists "A, B, C, D" → AI writes "1. A, 2. B, 3. C, 4. D" → wrong. ALWAYS confirm rank explicitly.
- **Asking too many questions at once.** Even bundling 2 violates the rule.
- **Overwriting the file** instead of patching specific sections — destroys prior content.
- **Adding AI-generated content** to fill out sections. Sections stay empty until Rouven provides the content.
- **Skipping the file update** between Q&A pairs — the doc falls out of sync.
