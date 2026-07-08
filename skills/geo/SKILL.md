---
name: geo
description: >
  GEO (Generative Engine Optimization) analysis for AI-powered search. Optimizes
  websites so AI systems (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews)
  can discover, understand, and cite them. Covers citability scoring, AI crawler
  access, llms.txt analysis and generation, brand mention scanning, platform-specific
  AI-search optimization, schema-for-AI markup, and client-ready GEO reports. Use
  when the user says "geo", "AI search", "AI visibility", "citability", "llms.txt",
  "brand mentions", "GEO report", or "schema for AI".
allowed-tools: Read, Grep, Glob, Bash, WebFetch, Write
---

# GEO-SEO Analysis Tool — Claude Code Skill

> **Philosophy:** GEO-first, SEO-supported. AI search is eating traditional search.
> This tool optimizes for where traffic is going, not where it was.

---

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `/geo audit <url>` | Full GEO + SEO audit with parallel subagents |
| `/geo page <url>` | Deep single-page GEO analysis |
| `/geo citability <url>` | Score content for AI citation readiness |
| `/geo crawlers <url>` | Check AI crawler access (robots.txt analysis) |
| `/geo llmstxt <url>` | Analyze or generate llms.txt file |
| `/geo brands <url>` | Scan brand mentions across AI-cited platforms |
| `/geo platforms <url>` | Platform-specific optimization (ChatGPT, Perplexity, Google AIO) |
| `/geo schema <url>` | Detect, validate, and generate structured data |
| `/geo technical <url>` | Traditional technical SEO audit |
| `/geo content <url>` | Content quality and E-E-A-T assessment |
| `/geo report <url>` | Generate client-ready GEO deliverable |
| `/geo report-pdf <url>` | Generate professional PDF report with charts and scores |
| `/geo quick <url>` | 60-second GEO visibility snapshot |

---

## Orchestration Logic

### Full Audit (`/geo audit <url>`)

**Phase 1: Discovery (Sequential)**
1. Fetch homepage HTML (curl or WebFetch)
2. Detect business type (SaaS, Local, E-commerce, Publisher, Agency, Other)
3. Extract key pages from sitemap.xml or internal links (up to 50 pages)

**Phase 2: Parallel Analysis (Delegate to Subagents)**
Launch these 5 subagents simultaneously:

| Subagent | File | Responsibility |
|----------|------|---------------|
| geo-ai-visibility | `~/.claude/agents/geo-ai-visibility.md` | GEO audit, citability, AI crawlers, llms.txt, brand mentions |
| geo-platform-analysis | `~/.claude/agents/geo-platform-analysis.md` | Platform-specific optimization (ChatGPT, Perplexity, Google AIO) |
| geo-technical | `~/.claude/agents/geo-technical.md` | Technical SEO, Core Web Vitals, crawlability, indexability |
| geo-content | `~/.claude/agents/geo-content.md` | Content quality, E-E-A-T, readability, AI content detection |
| geo-schema | `~/.claude/agents/geo-schema.md` | Schema markup detection, validation, generation |

**Phase 3: Synthesis (Sequential)**
1. Collect all subagent reports
2. Calculate composite GEO Score (0-100)
3. Generate prioritized action plan
4. Output client-ready report

### Scoring Methodology

The composite GEO Score formula and all per-dimension sub-weights live in one place: **`references/scoring.md`**. Use those weights for Phase 3 synthesis — do not re-derive them here.

---

## Issue Severity Classification

Every issue found during the audit is classified by severity:

### Critical (Fix Immediately)
- All AI crawlers blocked in robots.txt
- No indexable content (JavaScript-rendered only with no SSR)
- Domain-level noindex directive
- Site returns 5xx errors on key pages
- Complete absence of any structured data
- Brand not recognized as an entity by any AI system

### High (Fix Within 1 Week)
- Key AI crawlers (GPTBot, ClaudeBot, PerplexityBot) blocked
- No llms.txt file present
- Zero question-answering content blocks on key pages
- Missing Organization or LocalBusiness schema
- No author attribution on content pages
- All content behind login/paywall with no preview

### Medium (Fix Within 1 Month)
- Partial AI crawler blocking (some allowed, some blocked)
- llms.txt exists but is incomplete or malformed
- Content blocks average under 50 citability score
- Missing FAQ schema on pages with FAQ content
- Thin author bios without credentials
- No Wikipedia or Reddit brand presence

### Low (Optimize When Possible)
- Minor schema validation errors
- Some images missing alt text
- Content freshness issues on non-critical pages
- Missing Open Graph tags
- Suboptimal heading hierarchy on some pages
- LinkedIn company page exists but is incomplete

---

## Audit Report Template

Generate a file called `GEO-AUDIT-REPORT.md` with the following structure:

```markdown
# GEO Audit Report: [Site Name]

**Audit Date:** [Date]
**URL:** [URL]
**Business Type:** [Detected Type]
**Pages Analyzed:** [Count]

---

## Executive Summary

**Overall GEO Score: [X]/100 ([Rating])**

[2-3 sentence summary of the site's GEO health, biggest strengths, and most critical gaps.]

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | [X]/100 | 25% | [X] |
| Brand Authority | [X]/100 | 20% | [X] |
| Content E-E-A-T | [X]/100 | 20% | [X] |
| Technical GEO | [X]/100 | 15% | [X] |
| Schema & Structured Data | [X]/100 | 10% | [X] |
| Platform Optimization | [X]/100 | 10% | [X] |
| **Overall GEO Score** | | | **[X]/100** |

---

## Critical Issues (Fix Immediately)

[List each critical issue with specific page URLs and recommended fix]

## High Priority Issues

[List each high-priority issue with details]

## Medium Priority Issues

[List each medium-priority issue]

## Low Priority Issues

[List each low-priority issue]

---

## Category Deep Dives

### AI Citability ([X]/100)
[Detailed findings, examples of good/bad passages, rewrite suggestions]

### Brand Authority ([X]/100)
[Platform presence map, mention volume, sentiment]

### Content E-E-A-T ([X]/100)
[Author quality, source citations, freshness, depth]

### Technical GEO ([X]/100)
[Crawler access, llms.txt, rendering, headers]

### Schema & Structured Data ([X]/100)
[Schema types found, validation results, missing opportunities]

### Platform Optimization ([X]/100)
[Presence on YouTube, Reddit, Wikipedia, etc.]

---

## Quick Wins (Implement This Week)

1. [Specific, actionable quick win with expected impact]
2. [Another quick win]
3. [Another quick win]
4. [Another quick win]
5. [Another quick win]

## 30-Day Action Plan

### Week 1: [Theme]
- [ ] Action item 1
- [ ] Action item 2

### Week 2: [Theme]
- [ ] Action item 1
- [ ] Action item 2

### Week 3: [Theme]
- [ ] Action item 1
- [ ] Action item 2

### Week 4: [Theme]
- [ ] Action item 1
- [ ] Action item 2

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| [url] | [title] | [issue count] |
```

---

## Business Type Detection

Analyze homepage for patterns:

| Type | Signals |
|------|---------|
| **SaaS** | Pricing page, "Sign up", "Free trial", "/app", "/dashboard", API docs |
| **Local Service** | Phone number, address, "Near me", Google Maps embed, service area |
| **E-commerce** | Product pages, cart, "Add to cart", price elements, product schema |
| **Publisher** | Blog, articles, bylines, publication dates, article schema |
| **Agency** | Portfolio, case studies, "Our services", client logos, testimonials |
| **Other** | Default — apply general GEO best practices |

Adjust recommendations based on detected type. Local businesses need LocalBusiness schema and Google Business Profile optimization. SaaS needs SoftwareApplication schema and comparison page strategy. E-commerce needs Product schema and review aggregation.

---

## Sub-Skills (10 Specialized Components)

| # | Skill | Directory | Purpose |
|---|-------|-----------|---------|
| 1 | geo-citability | `skills/geo-citability/` | Passage-level AI citation readiness |
| 2 | geo-crawlers | `skills/geo-crawlers/` | AI crawler access and robots.txt |
| 3 | geo-llmstxt | `skills/geo-llmstxt/` | llms.txt standard analysis and generation |
| 4 | geo-brand-mentions | `skills/geo-brand-mentions/` | Brand presence on AI-cited platforms |
| 5 | geo-platform-optimizer | `skills/geo-platform-optimizer/` | Platform-specific AI search optimization |
| 6 | geo-schema | `skills/geo-schema/` | Structured data for AI discoverability |
| 7 | geo-technical | `skills/geo-technical/` | Technical SEO foundations |
| 8 | geo-content | `skills/geo-content/` | Content quality and E-E-A-T |
| 9 | geo-report | `skills/geo-report/` | Client-ready deliverable generation |
| 10 | geo-report-pdf | `skills/geo-report-pdf/` | Professional PDF report from audit data |

---

## Subagents (5 Parallel Workers)

| Agent | File | Skills Used |
|-------|------|-------------|
| geo-ai-visibility | `~/.claude/agents/geo-ai-visibility.md` | geo-citability, geo-crawlers, geo-llmstxt, geo-brand-mentions |
| geo-platform-analysis | `~/.claude/agents/geo-platform-analysis.md` | geo-platform-optimizer |
| geo-technical | `~/.claude/agents/geo-technical.md` | geo-technical |
| geo-content | `~/.claude/agents/geo-content.md` | geo-content |
| geo-schema | `~/.claude/agents/geo-schema.md` | geo-schema |

---

## Output Files

All commands generate structured output:

| Command | Output File |
|---------|------------|
| `/geo audit` | `GEO-AUDIT-REPORT.md` |
| `/geo page` | `GEO-PAGE-ANALYSIS.md` |
| `/geo citability` | `GEO-CITABILITY-SCORE.md` |
| `/geo crawlers` | `GEO-CRAWLER-ACCESS.md` |
| `/geo llmstxt` | `llms.txt` (ready to deploy) |
| `/geo brands` | `GEO-BRAND-MENTIONS.md` |
| `/geo platforms` | `GEO-PLATFORM-OPTIMIZATION.md` |
| `/geo schema` | `GEO-SCHEMA-REPORT.md` + generated JSON-LD |
| `/geo technical` | `GEO-TECHNICAL-AUDIT.md` |
| `/geo content` | `GEO-CONTENT-ANALYSIS.md` |
| `/geo report` | `GEO-CLIENT-REPORT.md` (presentation-ready) |
| `/geo report-pdf` | `GEO-REPORT.pdf` (professional PDF with charts) |
| `/geo quick` | Inline summary (no file) |

---

## PDF Report Generation

The `/geo report-pdf <url>` command generates a professional, branded PDF report:

### How It Works
1. Run the full audit or individual analyses first
2. Collect all scores and findings into a JSON structure
3. Execute the PDF generator: `python3 ~/.claude/skills/geo/scripts/generate_pdf_report.py data.json GEO-REPORT.pdf`

### What the PDF Includes
- **Cover page** with GEO score gauge visualization
- **Score breakdown** with color-coded bar charts
- **AI Platform Readiness** dashboard with horizontal bar chart
- **Crawler Access** status table with color-coded Allow/Block
- **Key Findings** categorized by severity (Critical/High/Medium/Low)
- **Prioritized Action Plan** (Quick Wins, Medium-Term, Strategic)
- **Methodology & Glossary** appendix

### Workflow
1. First run `/geo audit <url>` to collect all data
2. Then run `/geo report-pdf <url>` to generate the PDF
3. The tool will compile audit data into JSON, then generate the PDF
4. Output: `GEO-REPORT.pdf` in the current directory

---

## Quality Gates

- **Crawl limit:** Max 50 pages per audit (focus on quality over quantity)
- **Timeout:** 30 seconds per page fetch
- **Rate limiting:** 1-second delay between requests, max 5 concurrent
- **Robots.txt:** Always respect, always check
- **Duplicate detection:** Skip pages with >80% content similarity

---

## Quick Start Examples

```
# Full GEO audit of a website
/geo audit https://example.com

# Check if AI bots can see your site
/geo crawlers https://example.com

# Score a specific page for AI citability
/geo citability https://example.com/blog/best-article

# Generate an llms.txt file for your site
/geo llmstxt https://example.com

# Get a 60-second visibility snapshot
/geo quick https://example.com

# Generate a client-ready report
/geo report https://example.com
```
