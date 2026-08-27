# The Masters Market Atlas

A bilingual (English / 简体中文) competitive-intelligence report for **AcademiaOne**: 141 companies across the Chinese and international Masters-application market, researched August 2026.

## Open the report

**[`academiaone-competitor-report.html`](academiaone-competitor-report.html)** — a single self-contained file. Download it and open in any browser. Use the EN / 中文 toggle (top right).

22 chapters in five parts:

| Part | Chapters |
|---|---|
| I · The Market | Executive summary · Method & data confidence · Market in numbers · The competitive map |
| II · The Database | 141 companies — searchable, sortable, filterable, with full expandable profiles |
| III · China | Mega-agencies · Premium boutiques · Platform graveyard · Background services · Communities · UK–HK–SG battleground |
| IV · The World | Global platforms · Pathways & B2B · Western premium & MBA |
| V · How to Win | The Crimson playbook · Marketing & CAC · The money map · Why they die · Patterns & insights · The AcademiaOne strategy · Roadmap, KPIs & risks · Sources |

## What's in `report/`

- `parts/` — the report source, one file per chapter; concatenated by `build.sh`
- `data/companies.json` — the machine-readable 141-company dataset (name, 中文名, founding, funding, team estimates, pricing, marketing channels, positioning, problems, lessons — bilingual key fields, confidence-graded, with sources)
- `data/digest-*.md` — per-category research digests
- `data/dive-*.md` — deep dives: the Crimson scaling playbook, China outbound market data, customer-acquisition economics, failure post-mortems
- `data/synth-*.md` — cross-company pattern analysis and the strategy synthesis
- `pipeline.js` — rebuilds the dataset from research output; `qa.js` — automated render/data QA (Playwright)

## Updating

Edit a chapter in `report/parts/`, then:

```bash
cd report && bash build.sh && cp standalone.html ../academiaone-competitor-report.html
```

Data-confidence rules are in Chapter 02 of the report: figures marked `est.` are directional estimates from hiring platforms, account footprints and analogous companies — verify against primary sources before quoting externally.
