---
title: Port Manufacturing Content Templates from website-demo into rosedale-demo-base
type: feat
status: completed
date: 2026-04-17
---

# Port Manufacturing Content Templates from website-demo into rosedale-demo-base

## Overview

Mine the richest manufacturing-domain content from [/Users/grantwilkinson/Desktop/website-demo](../../../website-demo/) — the dashboards, chart configurations, and domain vocabulary — and re-express it as self-contained reference files under [templates/](../../templates/). Every ported page must read like native `rosedale-demo-base` code: Manrope typography, `--chart-1..5` via CSS vars, shadcn `<Button>`, Phosphor light icons, the existing `bg-card border border-border rounded-xl` card primitive, and `bg-emerald-50 / bg-amber-50 / bg-muted` status chips. Do **not** port website-demo's "glass" / "forge-" design tokens, lucide icons, conic-gradient gauges, or any auth/DB/AI-SDK wiring.

V0 learns compositions by reading `templates/` as plain source — these files never enter Next.js routing ([tsconfig.json:22](../../tsconfig.json#L22) excludes them from typecheck too). Shipping three or four manufacturing-shaped reference pages gives V0 the vocabulary to generate convincing client demos when the input brief mentions OEE, work orders, suppliers, or quoting.

## Problem Statement / Motivation

**What V0 knows today.** The base repo currently ships two teaching templates: [templates/app/page.tsx](../../templates/app/page.tsx) (KPI row + bar chart) and [templates/app/[tab]/page.tsx](../../templates/app/[tab]/page.tsx) (header + separator-divided row list with status chips). They teach the shell and the primitive vocabulary, but they're intentionally generic — "Issues completed", "In progress". Nothing industry-shaped.

**What breaks for manufacturing clients.** When a client brief says "we're a precision CNC shop tracking OEE across 24 machines, supplier OTD, and a quoting pipeline," V0 has no in-repo example of what a production-floor page *looks like* composed in Rosedale's style. It can produce something generic, but tends to drift toward stock data-viz tropes or toward importing patterns from other repos it was trained on — not this one.

**Why website-demo is the right source.** [website-demo/lib/mock-data.ts](../../../website-demo/lib/mock-data.ts) alone carries 1850+ lines of hand-crafted manufacturing content: work orders on Ti-6Al-4V, Mazak and DMG Mori machine fleets, supplier scorecards, operation routings (Op 10 Laser → Op 60 Anodize), FAIR/ISO documents, cost-breakdown structures. And the dashboards are built on Recharts — already the Rosedale chart library — so the chart code is largely translatable once colors and containers are swapped.

**Why it must be restyled, not copy-pasted.** website-demo has its own visual system ("glass-solid", "forge-" color tokens, lucide icons, large bespoke gauges). Copy-pasting would contaminate Rosedale's design language — the very thing the proper-prospecting-dashboard precedent proves V0 can produce reliably when given clean examples. The port is a *design translation*, not a file copy.

## Proposed Solution

Ship **three manufacturing dashboard pages** plus a **lightweight primitives reference file**, all under [templates/](../../templates/), and update the README to teach V0 when to reach for each.

### Taxonomy (mirrors current convention)

```
templates/
├─ app/
│  ├─ page.tsx                     # existing — generic KPI home
│  ├─ [tab]/page.tsx               # existing — generic list detail
│  ├─ shop-floor/page.tsx          # NEW — OEE + machine grid + timeline
│  ├─ delivery/page.tsx            # NEW — supplier OTD + at-risk orders
│  └─ quoting/page.tsx             # NEW — quote table + cost breakdown
└─ components/                     # NEW directory
   └─ dashboards/manufacturing-primitives.tsx   # NEW — StatCard, Sparkline, Timeline, StatusDot refs
```

**Why mirror `app/`:** V0 already reads `templates/app/page.tsx` and `templates/app/[tab]/page.tsx` as "this is a page-shaped composition." Adding `templates/app/<slug>/page.tsx` extends that convention without teaching V0 a new path shape. Each page is self-contained — inline helper components, inline data constants, one file V0 can chunk and mirror.

**Why one primitives file too:** After three pages, the shared helpers (StatCard with delta triangle, sparkline, vertical timeline item, colored status dot) will have been re-implemented three times. Extract them into one reference file so V0 can learn the single canonical shape of each. Keep it to one file, not a directory explosion.

### Content porting approach

For each target page:

1. **Take the composition structure** from website-demo (grid layout, card count, chart selection, table columns) — this is the IP we're extracting.
2. **Take the domain data** verbatim or near-verbatim from [website-demo/lib/mock-data.ts](../../../website-demo/lib/mock-data.ts) — the Ti-6Al-4V work orders, the supplier list, the operation numbers. This is *why* we're doing the port.
3. **Rewrite all styling** from scratch using Rosedale primitives. Do not grep-replace classes; read the Rosedale template and write fresh JSX in that idiom.
4. **Rewrite charts** using Recharts with `var(--chart-N)` fills and the canonical tooltip style from [templates/app/page.tsx:88-95](../../templates/app/page.tsx#L88-L95).
5. **Inline the data** as `const`s at the top of each file (plausible, manufacturing-specific, never Lorem / never "Acme Corp"). Target under 200 lines per page including data — V0 learns better from tight examples than sprawling ones.

### Design-token mapping table (website-demo → rosedale)

| website-demo pattern | rosedale equivalent |
|----|----|
| `bg-glass`, `bg-glass-solid`, custom `forge-*` tokens | `bg-card border border-border rounded-xl` |
| `lucide-react` icons | `@phosphor-icons/react` with `weight="light"` |
| Hardcoded hex in charts (`#B85C3A`, `#1a73e8`) | `var(--chart-1)`..`var(--chart-5)` only |
| Custom buttons | shadcn `<Button>` from [components/ui/button.tsx](../../components/ui/button.tsx) |
| Status with bespoke classes | `bg-emerald-50 text-emerald-700` / `bg-amber-50 text-amber-700` / `bg-rose-50 text-rose-700` / `bg-muted text-muted-foreground` |
| Card titles `text-sm font-semibold` variants | `text-sm font-semibold` (body) + `text-xs text-muted-foreground` (subtitle) |
| Large numeric `.text-2xl`/`.text-3xl` | Same classes — [globals.css:105-112](../../app/globals.css#L105-L112) already maps these to Manrope 700 / -0.015em tracking |
| Conic-gradient gauges | Recharts `RadialBarChart` with one or two bars; if it fights the design, skip the gauge |
| Separator-less lists | Use `<Separator />` from [components/ui/separator.tsx](../../components/ui/separator.tsx) between rows |
| Tooltip styling | `contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}` |

### Page briefs

**1. `templates/app/shop-floor/page.tsx` — Shop Floor Monitor**

- 4-up KPI row: OEE (84.2%), Utilization (78.4%), Active WOs (14), Shift Coverage (92%). Each with delta badge.
- Two-column split: machine status table (left, 8 machines with status dot + current job + OEE %) and maintenance timeline card (right, 5 events with type chip and AI-confidence badge).
- Sourced from: [website-demo/components/shop-floor/MachineStatusGrid.tsx](../../../website-demo/components/shop-floor/MachineStatusGrid.tsx), [MaintenanceTimeline.tsx](../../../website-demo/components/shop-floor/MaintenanceTimeline.tsx).
- Demonstrates: dense table, colored status dots, vertical timeline with dot + line, chip variants.

**2. `templates/app/delivery/page.tsx` — Delivery Intelligence**

- 4-up KPI row: OTD (87.3%), At-Risk Orders (7), Lead Variance (+2.4d), Revenue at Risk ($482K).
- Two-column chart split: supplier OTD area chart (12 weeks vs. 95% target reference line) + late-cause donut (4 slices using `--chart-1..4`).
- Below: at-risk orders table (PO, supplier, material, risk-level chip). 6 rows.
- Sourced from: [website-demo/components/delivery/SupplierOtdChart.tsx](../../../website-demo/components/delivery/SupplierOtdChart.tsx), [DelayRootCauseDonut.tsx](../../../website-demo/components/delivery/DelayRootCauseDonut.tsx), [AtRiskOrdersTable.tsx](../../../website-demo/components/delivery/AtRiskOrdersTable.tsx).
- Demonstrates: area chart with gradient, reference line + label, donut with legend, table with risk chips.

**3. `templates/app/quoting/page.tsx` — Quoting Pipeline**

- 3-up KPI row: Win Rate (64.2%), Avg Turnaround (2.4h), Pipeline Value ($1.8M).
- Static-looking filter tabs (All / Draft / Review / Sent / Won / Lost) — visual only, no onClick. Use shadcn Button ghost variant or custom pill row.
- Quote table: 6 rows with client, part, amount, margin %, confidence %, status chip.
- Below: cost breakdown horizontal bar chart (Material, Machine Time, Labor, Setup, Tooling, Overhead, Margin) as one card. Uses Recharts BarChart with `layout="vertical"`.
- Sourced from: [website-demo/components/quoting/QuoteTable.tsx](../../../website-demo/components/quoting/QuoteTable.tsx), [CostBreakdownChart.tsx](../../../website-demo/components/quoting/CostBreakdownChart.tsx).
- Demonstrates: horizontal bar chart, filter-tab row pattern, table with numeric right-align + chip column.

**4. `templates/components/dashboards/manufacturing-primitives.tsx` — Shared primitives reference**

One file exporting four small, commented components V0 can mirror:
- `StatCard` — label + big value + delta with inline up/down triangle SVG in muted green (`#6b8f71`) / rose (`#b05a5a`).
- `Sparkline` — 60×24 Recharts LineChart, single stroke color `var(--chart-1)`, no axes.
- `TimelineItem` — dot (colored by type) + vertical line + title/description + chip + optional AI-confidence line.
- `StatusDot` — 8×8 rounded-full span with variants: running / idle / setup / maintenance / down.

Each exported component carries a short `// TEMPLATE — ...` header comment in the style of the existing reference files.

### Helpful guardrails for the authoring session

- **No new npm dependencies.** Phosphor, Recharts, shadcn primitives, Tailwind v4 are already installed. If you can't build something without adding a package, scope it out or swap the approach.
- **No import from `website-demo/`.** Everything is retyped — treat website-demo as a spec, not a module.
- **No cross-template imports.** Each page template imports only from `@/app/components/layout/*` and `@/components/ui/*`. Primitives in `templates/components/dashboards/manufacturing-primitives.tsx` stay self-contained there; page templates re-inline equivalents rather than importing from the primitives file. (V0 learns better from self-contained examples.)
- **Typography stays in lane.** `text-2xl` for page h1, `text-sm font-semibold` for card titles, `text-xs text-muted-foreground` for labels and subtitles, `text-[11px]` for chip/meta — never pick new sizes.
- **Numbers use `tabular-nums` class** on KPI values and table numeric columns. (Not currently required by globals.css, but Manrope + `tabular-nums` gives the editorial number feel.)
- **Buttons do nothing.** Honors README rule — no onClick, no state, no filtering even if the UI *looks* filterable.

## Technical Considerations

- **Templates are not type-checked.** [tsconfig.json:22](../../tsconfig.json#L22) excludes `templates/` from the compile. This is correct for V0's purposes but means `next build` won't catch a malformed template. Mitigation: after writing each template, temporarily remove it from the exclude list and run `npx tsc --noEmit` locally to verify, then restore the exclude before committing. Or: run `npm run build` anyway and visually eyeball each file for obvious typos.
- **AppShell usage.** Existing templates wrap in `<AppShell>` ([templates/app/page.tsx:59](../../templates/app/page.tsx#L59)). New templates follow suit so V0 sees the full page structure, not a headless fragment.
- **Data volume.** A full machine fleet is ~24 rows; a supplier scorecard is ~12 rows. Target *8 rows max per table* in templates — V0 learns the shape from 8 rows as well as from 24, and file size stays V0-ingestible.
- **Chart color discipline.** `--chart-1` through `--chart-5` only. For donuts that need 4+ slices, use all five vars in order. Never `fill="red"` or `stroke="#B85C3A"` even when the source file does.
- **Real customer names.** website-demo uses a mix of real and plausibly-renamed customers ("Northrop Grumman" alongside "Northvane Aero", "Cascade Heavy Eng."). For public-facing demo seeds, prefer the plausibly-renamed set. Real company names risk implying real customer relationships in generated client demos. Rule: use industry-plausible-but-fictional names (Northvane Aero, Cascade Heavy Eng., Summit Alloys, Trident Metalworks, Meridian Process).
- **Accessibility.** Inherited from shadcn Radix primitives where used; charts carry no a11y obligations in a seed-only repo. Don't add aria-labels just for show.

## System-Wide Impact

- **Interaction graph**: Adding files under `templates/` has zero runtime impact — `tsconfig.json` excludes the path from compilation, and `templates/` is outside Next.js's `app/` conventions so nothing is routed or bundled. The only downstream consumer is V0, which reads raw source.
- **V0 context quality**: More examples = better generations, but also more tokens consumed when V0 ingests the repo. Three manufacturing pages at ~180 lines each + one primitives file at ~120 lines ≈ 660 lines of new context. Manageable; existing templates already carry similar weight.
- **State lifecycle risks**: None. Templates never execute. No caches, no DB, no orphaned state.
- **API surface parity**: The only "interface" is the teaching convention itself — the `// TEMPLATE — ...` comment header, the self-contained structure, the AppShell wrap. Every new template must match that convention or V0 learns an inconsistent lesson.
- **Integration test scenarios**: Not applicable — no integration surface. Verification is visual + grep-based (see Acceptance Criteria).

## Acceptance Criteria

### Per-template deliverables

- [ ] [templates/app/shop-floor/page.tsx](../../templates/app/shop-floor/page.tsx) created — KPI row + machine grid + maintenance timeline. Under 220 lines.
- [ ] [templates/app/delivery/page.tsx](../../templates/app/delivery/page.tsx) created — KPI row + OTD area chart + late-cause donut + at-risk table. Under 220 lines.
- [ ] [templates/app/quoting/page.tsx](../../templates/app/quoting/page.tsx) created — KPI row + filter tabs + quote table + cost breakdown bar chart. Under 220 lines.
- [ ] [templates/components/dashboards/manufacturing-primitives.tsx](../../templates/components/dashboards/manufacturing-primitives.tsx) created — StatCard, Sparkline, TimelineItem, StatusDot. Under 180 lines.

### Style-fidelity gates (grep-checked)

- [ ] Zero hex colors in new template JSX: `grep -rnE "#[0-9a-fA-F]{3,8}" templates/app/{shop-floor,delivery,quoting}/` returns nothing except the delta triangle colors (`#6b8f71`, `#b05a5a`) in the primitives file.
- [ ] Zero `lucide-react` imports: `grep -rn "lucide-react" templates/` returns nothing.
- [ ] Zero imports from `website-demo` or outside-project paths: `grep -rnE "from ['\"](\.\.\/){2,}" templates/app/{shop-floor,delivery,quoting}/` returns nothing.
- [ ] Every chart color is a CSS var: `grep -rn "chart-[1-5]" templates/app/{shop-floor,delivery,quoting}/` returns hits in every chart-containing page.
- [ ] Every button uses the primitive: `grep -rn "<button" templates/app/{shop-floor,delivery,quoting}/` returns nothing (only `<Button>` from shadcn).
- [ ] Every page wraps in `<AppShell>`: check manually in the three new page files.
- [ ] Every file carries a `// TEMPLATE — ...` comment header matching the convention in [templates/app/page.tsx:1-9](../../templates/app/page.tsx#L1-L9).

### Content quality gates (manual review)

- [ ] No Lorem Ipsum anywhere.
- [ ] No "Acme", no "Company A/B/C", no placeholder vendor names.
- [ ] Every KPI has a plausible value with units (percentage, dollars, hours, count).
- [ ] Every table row has industry-realistic content (real alloy grades, plausible part names, real-looking work-order IDs).
- [ ] Customer names are plausibly-fictional per the "no real companies" guidance above.
- [ ] Delta indicators make sense directionally (✓ for improvement, ✗ for regression).

### Documentation gates

- [ ] [README.md](../../README.md) `What's here` table gains rows for each new template with the `V0 should...` guidance column populated.
- [ ] A short new section in the README — "Industry templates" — explains that V0 picks one whose shape matches the client brief and mirrors the composition, not that it includes them in routing. One paragraph max.

### Build gate

- [ ] `npm install && npm run build` still passes with a trivial placeholder `app/page.tsx`.
- [ ] Manual verification: temporarily remove `templates` from `tsconfig.json` exclude, run `npx tsc --noEmit`, fix any type errors, restore exclude, do not commit the tsconfig edit.

## Success Metrics

- **Primary signal**: next V0-generated manufacturing demo visually reads as "Rosedale-style" on first render — same card shape, same chart palette, same status chip treatment, same typography as [templates/app/page.tsx](../../templates/app/page.tsx) and proper-prospecting-dashboard. Verifiable by eyeballing the first manufacturing demo after this ships.
- **Secondary signal**: V0 generations stop drifting into lucide icons or hex colors for manufacturing briefs. Observable via spot-check of `app/**/page.tsx` in generated demos — should contain only Phosphor imports and `var(--chart-N)` chart colors.
- **Tertiary signal**: no net new dependencies added to [package.json](../../package.json).

## Dependencies & Risks

- **Risk: content gets stale.** Specific machine models (Mazak VTC-800/30), material grades (Ti-6Al-4V), and process names are current as of 2026 but evolve. Mitigation: the content is plausible, not authoritative — V0 adapts per client brief, so drift is tolerable for a seed repo.
- **Risk: V0 over-fits to manufacturing.** If a finance or healthcare client brief comes in, V0 might over-reach for OEE vocabulary. Mitigation: the existing generic templates ([templates/app/page.tsx](../../templates/app/page.tsx), [templates/app/[tab]/page.tsx](../../templates/app/[tab]/page.tsx)) remain in place, and V0 treats templates as a menu, not a prescription. README should emphasize this in the new "Industry templates" section.
- **Risk: customer-name concerns in generated demos.** See Technical Considerations — use plausibly-fictional customer names only.
- **Risk: template drift.** Once three manufacturing pages exist, primitive patterns (KPI tile, card header) could diverge across files if authored loosely. Mitigation: the primitives reference file ships alongside pages; author pages and primitives in the same sitting so shapes stay in sync.
- **Dependency: version tag bump.** Per [README.md:60-62](../../README.md#L60-L62), adding shell files or layout changes warrants a `v0.N.0` tag increment. Templates aren't shell files, but they are a meaningful addition to V0's seed corpus — coordinate with rosedale-os on whether this warrants `v0.2.0`.

## Sources & References

### Rosedale internal references (design contract)

- [README.md](../../README.md) — behavior rules (no auth, Recharts only, Manrope only, shadcn Button), templates/ convention.
- [app/globals.css](../../app/globals.css) — full token set, Manrope heading rule at line 105-112, surface-* tokens at line 84-88, chart palette at line 71-75.
- [templates/app/page.tsx](../../templates/app/page.tsx) — canonical KPI-plus-chart composition; match this shape exactly.
- [templates/app/[tab]/page.tsx](../../templates/app/[tab]/page.tsx) — canonical row-list composition + status chip pattern (lines 17-38).
- [app/components/layout/AppShell.tsx](../../app/components/layout/AppShell.tsx) — what every template wraps in.
- [components/ui/button.tsx](../../components/ui/button.tsx), [components/ui/separator.tsx](../../components/ui/separator.tsx), [components/ui/tooltip.tsx](../../components/ui/tooltip.tsx) — the primitive set.
- [tsconfig.json:22](../../tsconfig.json#L22) — confirms `templates/` is excluded from typecheck.
- [package.json](../../package.json) — installed deps; no new ones added.

### website-demo source references (content/composition to mine)

- [website-demo/lib/mock-data.ts](../../../website-demo/lib/mock-data.ts) — 1850-line manufacturing-domain content library; the gold.
- [website-demo/components/shop-floor/MachineStatusGrid.tsx](../../../website-demo/components/shop-floor/MachineStatusGrid.tsx) — machine table composition.
- [website-demo/components/shop-floor/MaintenanceTimeline.tsx](../../../website-demo/components/shop-floor/MaintenanceTimeline.tsx) — vertical timeline pattern.
- [website-demo/components/shop-floor/ShiftOverview.tsx](../../../website-demo/components/shop-floor/ShiftOverview.tsx) — shift-grouped operator list (optional future port).
- [website-demo/components/delivery/SupplierOtdChart.tsx](../../../website-demo/components/delivery/SupplierOtdChart.tsx) — Recharts AreaChart with gradient + reference line.
- [website-demo/components/delivery/DelayRootCauseDonut.tsx](../../../website-demo/components/delivery/DelayRootCauseDonut.tsx) — donut with inline legend.
- [website-demo/components/delivery/AtRiskOrdersTable.tsx](../../../website-demo/components/delivery/AtRiskOrdersTable.tsx) — table with risk chips.
- [website-demo/components/delivery/SupplierScorecard.tsx](../../../website-demo/components/delivery/SupplierScorecard.tsx) — sparkline + OTD bar pattern (optional future port).
- [website-demo/components/quoting/QuoteTable.tsx](../../../website-demo/components/quoting/QuoteTable.tsx) — filterable quote table.
- [website-demo/components/quoting/CostBreakdownChart.tsx](../../../website-demo/components/quoting/CostBreakdownChart.tsx) — horizontal bar chart.
- [website-demo/app/(dashboard)/shop-floor/page.tsx](../../../website-demo/app/(dashboard)/shop-floor/page.tsx) — dashboard page composition.
- [website-demo/app/(dashboard)/delivery/page.tsx](../../../website-demo/app/(dashboard)/delivery/page.tsx) — dashboard page composition.
- [website-demo/app/(dashboard)/quoting/page.tsx](../../../website-demo/app/(dashboard)/quoting/page.tsx) — dashboard page composition.

### Design-language reference (do not copy code — match aesthetic)

- `/Users/grantwilkinson/Desktop/Current Projects/Clients/Proper/proper-prospecting-dashboard/app/globals.css` — validates the surface-token + chart palette + Manrope heading approach. Confirms rosedale-demo-base is already aligned to this aesthetic.
- `/Users/grantwilkinson/Desktop/Current Projects/Clients/Proper/proper-prospecting-dashboard/app/components/shared/StatCard.tsx` — KPI tile reference with delta-triangle SVG pattern to mirror in the primitives file.
