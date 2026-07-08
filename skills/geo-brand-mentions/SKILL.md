---
name: geo-brand-mentions
description: Brand mention and authority scanner for AI visibility. Analyzes brand presence across platforms that AI models rely on for entity recognition and citation decisions. Produces a Brand Authority Score (0-100) with platform-specific recommendations.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
  - Write
---

# Brand Mention Scanner Skill

## Core Insight

Brand mentions correlate more strongly with AI visibility than traditional backlinks. **Unlinked brand mentions** -- references to a brand name without a hyperlink -- are a stronger predictor of whether AI systems cite and recommend a brand than Domain Rating or backlink count. The correlation figures, the platform correlation table, and their source (Ahrefs, Dec 2025, 75K brands) live in `../geo/references/stats.md` (`~/.claude/skills/geo/references/stats.md`).

The critical finding: **the platform where the mention appears matters enormously.** Not all mentions are equal. A mention on YouTube or Reddit carries far more weight for AI citation than a mention on a low-authority blog, because AI training data and retrieval systems disproportionately index high-engagement platforms.

This inverts a core assumption of traditional SEO. In traditional SEO, a backlink from a high-DR site is the gold standard. In GEO, an unlinked mention on Reddit or a YouTube video description may be more valuable than a dofollow backlink from a DR 70 blog.

---

## Platform Scoring Rubrics

Score each platform 0-100 using the rubrics below, then combine with the composite weights.

### YouTube (0-100)

| Score | Criteria |
|---|---|
| 90-100 | Active channel with 10K+ subscribers, regular uploads, brand mentioned in 20+ third-party videos, appears in YouTube search results for industry terms |
| 70-89 | Active channel with 1K+ subscribers, brand mentioned in 10-19 third-party videos, some YouTube search presence |
| 50-69 | Channel exists with some content, brand mentioned in 5-9 third-party videos, limited YouTube search presence |
| 30-49 | Channel exists but inactive, brand mentioned in 1-4 third-party videos |
| 10-29 | No channel or empty channel, brand mentioned in 1-2 videos only |
| 0-9 | No YouTube presence whatsoever |

### Reddit (0-100)

| Score | Criteria |
|---|---|
| 90-100 | Frequently recommended in relevant subreddits, predominantly positive sentiment, active official presence, own subreddit with 5K+ members, appears in top recommendations for industry queries |
| 70-89 | Regularly mentioned in relevant subreddits, mostly positive sentiment, some official presence, appears in multiple recommendation threads |
| 50-69 | Mentioned in several relevant threads, mixed sentiment, brand name is recognized by community members |
| 30-49 | Occasional mentions, limited to 1-2 subreddits, no official presence |
| 10-29 | Rare mentions, brand largely unknown on Reddit |
| 0-9 | No Reddit presence |

### Wikipedia (0-100)

| Score | Criteria |
|---|---|
| 90-100 | Detailed Wikipedia article (B-class or higher), Wikidata entry with complete properties, brand cited as reference in multiple articles, founder has Wikipedia page |
| 70-89 | Wikipedia article exists (start-class or higher), Wikidata entry exists, brand mentioned in 2+ other Wikipedia articles |
| 50-69 | Wikipedia article exists (stub or start), basic Wikidata entry, limited mentions in other articles |
| 30-49 | No Wikipedia article but brand is mentioned in other articles or cited as reference; Wikidata entry may exist |
| 10-29 | Brand mentioned in 1-2 Wikipedia articles as a passing reference only |
| 0-9 | No Wikipedia or Wikidata presence of any kind |

### LinkedIn (0-100)

| Score | Criteria |
|---|---|
| 90-100 | Active company page with 10K+ followers, leadership regularly posts thought leadership, brand frequently mentioned by industry professionals, strong employee profiles |
| 70-89 | Active company page with 5K+ followers, some employee thought leadership, occasional third-party mentions |
| 50-69 | Company page exists with 1K+ followers, irregular posting, limited third-party mentions |
| 30-49 | Company page exists but is sparse or inactive, few followers, no third-party mentions |
| 10-29 | Basic company page with minimal information |
| 0-9 | No LinkedIn company page |

### Other Platforms (supplementary)

Quora, Stack Overflow / Stack Exchange, GitHub, industry forums (Hacker News, ProductHunt), news/press, and podcasts carry lower but still meaningful correlation. Score as a single 0-100 supplementary bucket based on presence and quality across these. Stack Overflow and GitHub are high-signal for developer-facing brands and near-irrelevant for most B2C; news and podcast mentions decay with age (a mention in the last 6 months is far more valuable than one from 3 years ago).

---

## Composite Brand Authority Score

### Scoring Formula

Canonical weights (also recorded in `../geo/references/scoring.md`):

| Platform | Weight | Rationale |
|---|---|---|
| YouTube Presence | 25% | Strongest correlation with AI citation |
| Reddit Presence | 25% | Second strongest correlation; critical for product recommendations |
| Wikipedia / Wikidata | 20% | Entity recognition foundation; AI training data cornerstone |
| LinkedIn Authority | 15% | Professional authority signals; B2B relevance |
| Other Platforms | 15% | Supplementary signals from Quora, GitHub, news, forums, podcasts |

**Formula:**
```
Brand_Authority_Score = (YouTube * 0.25) + (Reddit * 0.25) + (Wikipedia * 0.20) + (LinkedIn * 0.15) + (Other * 0.15)
```

### Score Interpretation

| Score Range | Rating | Interpretation |
|---|---|---|
| 85-100 | Dominant | Brand is a well-recognized entity across AI platforms. Highly likely to be cited and recommended by AI systems. |
| 70-84 | Strong | Brand has solid cross-platform presence. AI systems likely recognize and cite it for relevant queries. |
| 50-69 | Moderate | Brand has presence on some platforms but gaps exist. AI citation is inconsistent. |
| 30-49 | Weak | Brand has limited platform presence. AI systems may not recognize it as a distinct entity. |
| 0-29 | Minimal | Brand has negligible platform presence. AI systems are unlikely to cite or recommend it. |

---

## Analysis Procedure

### Step 1: Identify Brand Information

Gather the following from the user or from the website:
- **Brand name** (exact spelling, including any official variants)
- **Founder/CEO name(s)**
- **Domain URL**
- **Industry/category**
- **Key products or services** (top 3)
- **Key competitors** (for comparison context)

### Step 2: Run the Brand Scanner

Run the scanner script as the primary pass — it checks the Wikipedia and Wikidata APIs directly and scans YouTube, Reddit, LinkedIn, and review platforms, returning per-platform presence plus a composite:

```bash
python3 ~/.claude/skills/geo/scripts/brand_scanner.py "<brand name>" [domain]
```

Treat the script's Wikipedia/Wikidata API result as authoritative — web search alone frequently returns false negatives for Wikipedia presence. Use WebFetch on `https://en.wikipedia.org/wiki/[Brand_Name]` and `https://en.wikipedia.org/wiki/[Founder_Name]` only as backup verification, and `site:` search only for supplemental context.

### Step 3: Platform Scanning Detail

Supplement the scanner with targeted checks where you need more depth:

**YouTube:** official channel (`youtube.com/@[brand]`), subscriber/video counts, latest upload, and third-party mention count (`"[brand name]" site:youtube.com`).

**Reddit:** official account and subreddit, dominant subreddits, thread volume, sentiment, and recommendation frequency (`"[brand name]" site:reddit.com`).

**LinkedIn:** company page (`linkedin.com/company/[brand]`), follower count, post frequency, employee count.

**Other:** `site:quora.com`, `site:stackoverflow.com`, `site:github.com`, `site:news.ycombinator.com`, and a broad name search filtered to the last 6 months for news mentions.

### Step 4: Sentiment Assessment

For Reddit and other discussion platforms, assess sentiment by analyzing the most recent and most prominent mentions:

| Sentiment | Indicators |
|---|---|
| **Positive** | Recommendations ("I love [brand]," "We switched to [brand] and...", "Highly recommend"), upvoted mentions, positive comparison against competitors |
| **Neutral** | Factual mentions ("We use [brand] for...", "[Brand] offers..."), questions about the brand, balanced comparisons |
| **Negative** | Complaints ("Avoid [brand]", "[Brand] has terrible support"), downvoted recommendations, negative comparisons |
| **Mixed** | Combination of positive and negative. Note the ratio and primary themes. |

### Step 5: Competitive Comparison (Optional)

If competitors are identified, do a quick scan of their platform presence for context. This helps calibrate the score -- a brand with "moderate" Reddit presence in an industry where competitors have zero Reddit presence is relatively strong.

### Step 6: Score Calculation

1. Score each platform (0-100) using the rubrics above.
2. Apply weights to calculate the composite Brand Authority Score.
3. Identify the strongest and weakest platforms.
4. Generate specific, actionable recommendations for the weakest platforms.

---

## Output Format

Generate a file called `GEO-BRAND-MENTIONS.md`:

```markdown
# Brand Authority Report: [Brand Name]

**Analysis Date:** [Date]
**Brand:** [Brand Name]
**Domain:** [URL]
**Industry:** [Industry]

---

## Brand Authority Score: [X]/100 ([Rating])

### Platform Breakdown

| Platform | Score | Weight | Weighted | Status |
|---|---|---|---|---|
| YouTube | [X]/100 | 25% | [X] | [Active Channel / Mentioned / Absent] |
| Reddit | [X]/100 | 25% | [X] | [Active / Discussed / Absent] |
| Wikipedia | [X]/100 | 20% | [X] | [Article / Mentioned / Absent] |
| LinkedIn | [X]/100 | 15% | [X] | [Active / Basic / Absent] |
| Other Platforms | [X]/100 | 15% | [X] | [Summary] |
| **Total** | | | **[X]/100** | |

---

## Platform Detail

### YouTube ([X]/100)

**Official Channel:** [Yes/No] | [URL if exists]
**Subscribers:** [Count or N/A]
**Videos:** [Count or N/A]
**Last Upload:** [Date or N/A]
**Third-Party Mentions:** [Estimated count]
**Key Findings:**
- [Finding 1]
- [Finding 2]

### Reddit ([X]/100)

**Official Account:** [Yes/No] | [URL if exists]
**Own Subreddit:** [Yes/No] | [URL and member count if exists]
**Mention Volume:** [Estimated thread count]
**Primary Subreddits:** [List of subreddits where brand is discussed]
**Sentiment:** [Positive/Negative/Neutral/Mixed]
**Key Findings:**
- [Finding 1]
- [Finding 2]

### Wikipedia ([X]/100)

**Company Article:** [Yes/No] | [URL if exists]
**Founder Article:** [Yes/No] | [URL if exists]
**Wikidata Entry:** [Yes/No] | [Q-number if exists]
**Cited in Other Articles:** [Yes/No] | [Which articles]
**Key Findings:**
- [Finding 1]
- [Finding 2]

### LinkedIn ([X]/100)

**Company Page:** [Yes/No] | [URL if exists]
**Followers:** [Count or N/A]
**Post Frequency:** [Weekly/Monthly/Rare/Never]
**Key Findings:**
- [Finding 1]
- [Finding 2]

### Other Platforms ([X]/100)

| Platform | Presence | Notes |
|---|---|---|
| Quora | [Yes/No] | [Brief note] |
| Stack Overflow | [Yes/No] | [Brief note] |
| GitHub | [Yes/No] | [Brief note] |
| Hacker News | [Yes/No] | [Brief note] |
| News/Press | [Yes/No] | [Brief note] |
| Podcasts | [Yes/No] | [Brief note] |

---

## Recommendations

### Immediate Actions (Week 1-2)

1. **[Platform]:** [Specific action to take with expected impact]
2. **[Platform]:** [Specific action]

### Short-Term Strategy (Month 1-3)

1. **[Platform]:** [Strategy with tactics]
2. **[Platform]:** [Strategy with tactics]

### Long-Term Authority Building (Month 3-12)

1. **[Platform]:** [Long-term strategy]
2. **[Platform]:** [Long-term strategy]

---

## Competitive Context

[If competitors were analyzed, show a brief comparison table]

| Brand | YouTube | Reddit | Wikipedia | LinkedIn | Other | Total |
|---|---|---|---|---|---|---|
| [Subject Brand] | [X] | [X] | [X] | [X] | [X] | **[X]** |
| [Competitor 1] | [X] | [X] | [X] | [X] | [X] | **[X]** |
| [Competitor 2] | [X] | [X] | [X] | [X] | [X] | **[X]** |

## Key Takeaway

[1-2 sentence summary of the brand's AI visibility standing and the single most impactful action to take]
```
