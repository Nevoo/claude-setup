# GEO Scoring (Canonical Reference)

This is the single place the GEO scoring math lives. The `geo` router, `geo-report`, and every scoring sub-skill point here for the composite formula and the canonical per-dimension weights. Where a skill and its (stale, 2026-02-18) agent twin disagreed on weights, the **skill weights win** and are the ones recorded below.

---

## Composite GEO Score (0-100)

The overall GEO Score is a weighted average of six category scores (each scored 0-100 by its sub-skill):

| Category | Weight | Measured By |
|---|---|---|
| **AI Citability** | 25% | `geo-citability` — passage scoring, answer-block quality, extractability |
| **Brand Authority** | 20% | `geo-brand-mentions` — third-party mentions, entity recognition signals |
| **Content E-E-A-T** | 20% | `geo-content` — Experience, Expertise, Authoritativeness, Trustworthiness |
| **Technical GEO** | 15% | `geo-technical` — SSR, crawler access, Core Web Vitals, crawlability |
| **Schema & Structured Data** | 10% | `geo-schema` — schema completeness, JSON-LD validation |
| **Platform Optimization** | 10% | `geo-platform-optimizer` — per-platform AI-search readiness |

**Formula:**
```
GEO_Score = (Citability * 0.25) + (Brand * 0.20) + (EEAT * 0.20) + (Technical * 0.15) + (Schema * 0.10) + (Platform * 0.10)
```

Round to the nearest integer. Cap at 100.

### Score Interpretation

| Score Range | Rating | Interpretation |
|---|---|---|
| 90-100 | Excellent | Top-tier GEO optimization; site is highly likely to be cited by AI |
| 75-89 | Good | Strong GEO foundation with room for improvement |
| 60-74 | Fair | Moderate GEO presence; significant optimization opportunities exist |
| 40-59 | Poor | Weak GEO signals; AI systems may struggle to cite or recommend |
| 0-39 | Critical | Minimal GEO optimization; site is largely invisible to AI systems |

---

## Per-Dimension Sub-Weights (skill versions — authoritative)

### AI Citability (`geo-citability`)
Block Citability Score = weighted average of five sub-dimensions:

```
Block_Citability = (Answer * 0.30) + (SelfContain * 0.25) + (Structure * 0.20) + (Stats * 0.15) + (Unique * 0.10)
```

| Sub-dimension | Weight |
|---|---|
| Answer Block Quality | 30% |
| Passage Self-Containment | 25% |
| Structural Readability | 20% |
| Statistical Density | 15% |
| Uniqueness & Original Data | 10% |

> Reconciled: the `geo-ai-visibility` agent previously used 25/20/20/20/15. The skill weights (30/25/20/15/10) are canonical.

### Brand Authority (`geo-brand-mentions`)
```
Brand_Authority_Score = (YouTube * 0.25) + (Reddit * 0.25) + (Wikipedia * 0.20) + (LinkedIn * 0.15) + (Other * 0.15)
```

| Platform | Weight |
|---|---|
| YouTube Presence | 25% |
| Reddit Presence | 25% |
| Wikipedia / Wikidata | 20% |
| LinkedIn Authority | 15% |
| Other Platforms | 15% |

### Content E-E-A-T (`geo-content`)

| Dimension | Weight |
|---|---|
| Experience | 25% |
| Expertise | 25% |
| Authoritativeness | 25% |
| Trustworthiness | 25% |

Plus a Topical Authority modifier of **+10 to -5**, applied to the E-E-A-T subtotal and capped at 100.

> Reconciled: the `geo-content` agent previously weighted E-E-A-T at 15% each inside a broader mix. The skill weights (25% each + topical modifier) are canonical.

### Technical GEO (`geo-technical`)
Eight categories summing to 100 points:

| Category | Points |
|---|---|
| Crawlability | 15 |
| Indexability | 12 |
| Security | 10 |
| URL Structure | 8 |
| Mobile Optimization | 10 |
| Core Web Vitals | 15 |
| Server-Side Rendering | 15 |
| Page Speed & Server Performance | 15 |

### Schema & Structured Data (`geo-schema`)
Twelve-criterion rubric summing to 100 points (Organization/Person 15, sameAs 15, Article+author 10, business-type schema 10, WebSite+SearchAction 5, BreadcrumbList 5, JSON-LD format 5, server-rendered 10, speakable 5, valid JSON/types 10, knowsAbout 5, no deprecated 5). See `geo-schema/SKILL.md` for the full rubric.

### Platform Optimization (`geo-platform-optimizer`)
Each of the five platforms (Google AIO, ChatGPT, Perplexity, Gemini, Bing Copilot) is scored 0-100 on its own rubric; the Platform Optimization score is the **average of the five**.

### AI Crawler Access (`geo-crawlers`)
Sub-score used inside the Technical GEO dimension:

| Component | Weight |
|---|---|
| Tier 1 Crawlers Allowed | 50% |
| Tier 2 Crawlers Allowed | 25% |
| No Blanket AI Blocks | 15% |
| AI-Specific Files Present (llms.txt, sitemap) | 10% |
