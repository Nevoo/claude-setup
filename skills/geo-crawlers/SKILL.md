---
name: geo-crawlers
description: AI crawler access analysis. Checks robots.txt, meta tags, and HTTP headers to determine which AI crawlers can access the site. Provides a complete access map and recommendations for maximizing AI visibility while maintaining appropriate control.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
  - Write
---

# AI Crawler Access Analysis Skill

## Purpose

This skill analyzes a website's accessibility to AI crawlers -- the bots that AI companies use to discover, index, and train on web content. If AI crawlers are blocked, the site's content cannot appear in AI-generated responses regardless of its quality. Crawler access is the foundational technical requirement for GEO.

## Key Insight

As of early 2026, many websites inadvertently block AI crawlers through overly aggressive robots.txt rules, inherited from legacy SEO configurations. A Originality.ai 2025 study found that over 35% of the top 1,000 websites block at least one major AI crawler, and 5-10% block all AI crawlers. Blocking AI crawlers is the single fastest way to become invisible in AI-generated search results.

---

## Crawler Roster (Pointer)

This skill is the **pointer-owner** for the AI-crawler roster. The full canonical roster — every crawler's operator, User-Agent string, blocking impact, per-crawler recommendation, tier assignment, and the maximum-AI-visibility robots.txt block — lives in **`../geo/references/crawlers.md`** (path from this skill: `~/.claude/skills/geo/references/crawlers.md`). Read it when you need the per-crawler detail. The quick-reference matrix below is kept here for at-a-glance use.

## Recommendation Matrix Summary

| Crawler | Tier | Recommendation | Reason |
|---|---|---|---|
| GPTBot | 1 | **ALLOW** | Powers ChatGPT Search (300M+ users) |
| OAI-SearchBot | 1 | **ALLOW** | Search-only, no training use |
| ChatGPT-User | 1 | **ALLOW** | User-initiated browsing |
| ClaudeBot | 1 | **ALLOW** | Claude web search and analysis |
| PerplexityBot | 1 | **ALLOW** | Best referral traffic AI search |
| Google-Extended | 2 | **ALLOW** | Gemini features; no search rank impact |
| GoogleOther | 2 | **ALLOW** | Google AI research |
| Applebot-Extended | 2 | **ALLOW** | Apple Intelligence (2B+ devices) |
| Amazonbot | 2 | **ALLOW** | Alexa and Amazon AI |
| FacebookBot | 2 | **ALLOW** | Meta AI (3B+ app users) |
| CCBot | 3 | Context | Training data only |
| anthropic-ai | 3 | Context | Training data only |
| Bytespider | 3 | **BLOCK** | Aggressive crawler, low benefit |
| cohere-ai | 3 | Context | Training data only |

### Google-Extended nuance

- **Purpose:** Controls whether Google uses your content for Gemini model training and AI Overviews improvement. **CRITICAL NOTE:** Blocking Google-Extended does NOT affect your Google Search rankings or your appearance in Google Search results. That is controlled by the standard Googlebot.
- **Impact of Blocking:** Content may not be used for Gemini training or to improve AI Overviews. However, your content can still appear in AI Overviews based on standard search indexing.
- **Recommendation:** **ALLOW** -- Blocking provides minimal content protection upside while reducing your presence in Google's AI features. Since it does not affect standard search ranking, the only reason to block is philosophical objection to training data usage.

For the complete maximum-AI-visibility robots.txt block, see `references/crawlers.md`.

---

## Analysis Procedure

### Step 1: Fetch and Parse robots.txt

1. Use WebFetch to retrieve `[domain]/robots.txt`. For scripted access testing across the AI crawler user-agents, run `python3 ~/.claude/skills/geo/scripts/fetch_page.py <url> robots` — it returns per-crawler `ai_crawler_status` (ALLOWED / BLOCKED / PARTIALLY_BLOCKED / NOT_MENTIONED).
2. Parse all User-agent directives and their associated Allow/Disallow rules.
3. For each AI crawler in `references/crawlers.md`:
   - Check if there is a specific User-agent block for that crawler
   - Check if there is a wildcard (`User-agent: *`) block that would apply
   - Determine effective access: **Allowed**, **Blocked**, or **Not Mentioned** (inherits wildcard rules)
4. Note any `Crawl-delay` directives that may slow AI crawler access.
5. Check for `Sitemap` directives (AI crawlers use these for discovery).

### Step 2: Check Meta Robots Tags

1. For a sample of 5-10 key pages, fetch the HTML and check for:
   - `<meta name="robots" content="noindex">` -- blocks all bots
   - `<meta name="robots" content="nofollow">` -- prevents link following
   - `<meta name="robots" content="noai">` -- emerging tag to block AI use
   - `<meta name="robots" content="noimageai">` -- blocks AI image training
   - Bot-specific meta tags: `<meta name="GPTBot" content="noindex">`
2. Record any page-level overrides of the robots.txt directives.

### Step 3: Check HTTP Headers

1. For the same sample pages, check response headers for:
   - `X-Robots-Tag: noindex` -- HTTP header equivalent of meta noindex
   - `X-Robots-Tag: noai` -- HTTP header to block AI use
   - `X-Robots-Tag: noimageai` -- blocks AI image training
   - Bot-specific headers: `X-Robots-Tag: GPTBot: noindex`
2. Note that HTTP headers override meta tags and apply to non-HTML resources too.

### Step 4: Check for AI-Specific Files

1. Check for `/llms.txt` (emerging standard for AI crawler guidance).
2. Check for `/.well-known/ai-plugin.json` (OpenAI plugin manifest).
3. Check for `/ai.txt` (proposed standard, similar to ads.txt for AI).
4. Record presence/absence and quality of each file.

### Step 5: Assess JavaScript Rendering Requirements

1. Check if the site is a Single Page Application (SPA) or heavily JavaScript-rendered.
2. AI crawlers vary in their JavaScript rendering capabilities:
   - GPTBot: Limited JS rendering
   - ClaudeBot: Limited JS rendering
   - PerplexityBot: Limited JS rendering
   - Googlebot: Full JS rendering (but Google-Extended inherits this)
3. If critical content requires JS rendering, flag this as a potential issue.
4. Check for Server-Side Rendering (SSR) or Static Site Generation (SSG) as mitigations.

---

## Output Format

Generate a file called `GEO-CRAWLER-ACCESS.md`:

```markdown
# AI Crawler Access Report: [Domain]

**Analysis Date:** [Date]
**Domain:** [Domain]
**robots.txt Status:** [Found/Not Found/Error]

---

## Crawler Access Summary

| Crawler | Operator | Tier | Status | Impact |
|---|---|---|---|---|
| GPTBot | OpenAI | 1 | [Allowed/Blocked/Not Mentioned] | [Impact description] |
| OAI-SearchBot | OpenAI | 1 | [Status] | [Impact] |
| ChatGPT-User | OpenAI | 1 | [Status] | [Impact] |
| ClaudeBot | Anthropic | 1 | [Status] | [Impact] |
| PerplexityBot | Perplexity | 1 | [Status] | [Impact] |
| Google-Extended | Google | 2 | [Status] | [Impact] |
| GoogleOther | Google | 2 | [Status] | [Impact] |
| Applebot-Extended | Apple | 2 | [Status] | [Impact] |
| Amazonbot | Amazon | 2 | [Status] | [Impact] |
| FacebookBot | Meta | 2 | [Status] | [Impact] |
| CCBot | Common Crawl | 3 | [Status] | [Impact] |
| anthropic-ai | Anthropic | 3 | [Status] | [Impact] |
| Bytespider | ByteDance | 3 | [Status] | [Impact] |
| cohere-ai | Cohere | 3 | [Status] | [Impact] |

## AI Visibility Score: [X]/100

**Tier 1 Access:** [X/5 crawlers allowed]
**Tier 2 Access:** [X/5 crawlers allowed]
**Tier 3 Access:** [X/4 crawlers allowed]

---

## Critical Issues

[List any Tier 1 crawlers that are blocked]

## Recommendations

### Immediate Actions
[Specific robots.txt changes needed]

### robots.txt Recommendation
```
[Complete recommended robots.txt content for AI crawlers — see references/crawlers.md]
```

### Additional Technical Findings
- **Meta Robots Tags:** [Findings]
- **X-Robots-Tag Headers:** [Findings]
- **JavaScript Rendering:** [Assessment]
- **llms.txt:** [Present/Absent]
- **Sitemap Accessibility:** [Assessment]
```

---

## Scoring for Crawler Access

The AI Crawler Access Score is calculated as:

| Component | Weight | Scoring |
|---|---|---|
| Tier 1 Crawlers Allowed | 50% | 20 points per Tier 1 crawler allowed (5 crawlers = 100 points max, scaled to 50) |
| Tier 2 Crawlers Allowed | 25% | 20 points per Tier 2 crawler allowed (5 crawlers = 100 points max, scaled to 25) |
| No Blanket AI Blocks | 15% | Full points if no `User-agent: *` Disallow: / and no noai meta tags |
| AI-Specific Files Present | 10% | 5 points for llms.txt, 5 points for sitemap accessible to AI crawlers |

Final score = sum of all weighted components, capped at 100.
