# feat(tools): vigilant-controller — financial anomaly triage page

**Branch:** `feat/tools-framework`
**Framework spec:** `docs/superpowers/specs/2026-05-08-tools-framework-design.md`
**UX reference:** `C:\Users\matte_uea9zx9\website-demo\docs\ux-vigilant-controller.md`
**Depends on:** plan #1 (quoting-tool) must merge first. Plan #2 (maintenance + schedule-pm) does not block this.

## Overview

Build the third and final tool: `vigilant-controller`, a financial anomaly detection page with click-to-expand inline triage and a savings sidebar. Smallest of the three plans — no new UI primitives, no shared-layer additions. Pure composition of what plans #1 and #2 already built. Validates the framework's "long-tail" promise that subsequent tools are cheap.

## Problem statement

Vigilant Controller is the third demo vertical. Per the framework spec build order, it's last because it has the lowest novel surface area (no modal, no slider, no chart). It exists primarily to prove that a tool can be built almost entirely from existing primitives and shared components.

## Proposed solution

One single-file tool at `components/tools/vigilant-controller.tsx`. Default-exports `VigilantController`, named-exports `VigilantControllerProps`. Owns the page composition (header + KPI row + 70/30 main content). All state local. No persistence.

V0's generated page:

```tsx
// app/vigilant/page.tsx (V0-generated)
import { VigilantController } from "@/components/tools/vigilant-controller";

export default function Page() {
  return (
    <VigilantController
      title="Vigilant Controller"
      subtitle="AI-powered financial anomaly detection"
      kpis={[/* 4 KPIs */]}
      findings={[/* mock anomaly rows */]}
      savings={{
        ytdRealized: 184200,
        identified: 47800,
        breakdown: [
          { label: "Freight Overcharges", amount: 64200 },
          { label: "Duplicate Invoices", amount: 52400 },
          { label: "Vendor Overcharges", amount: 41100 },
          { label: "Contract Non-compliance", amount: 26500 },
        ],
      }}
    />
  );
}
```

## Technical approach

### Architecture

One file lands in this plan: `components/tools/vigilant-controller.tsx`. No primitive additions, no shared-layer changes.

### Implementation

`"use client"`. Single file. Sub-components inline at the bottom. Target ≤500 lines (smallest tool).

**Public surface:**

```ts
export interface VigilantControllerProps {
  title: string;
  subtitle: string;
  kpis: [KpiSpec, KpiSpec, KpiSpec, KpiSpec];
  findings: Finding[];
  savings: SavingsSummary;
}

export interface Finding {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  dollarImpact: number;
  type: string; // e.g. "Invoice Duplicate", "Freight Overcharge"
  detectedAt: string; // ISO date
  status: "New" | "Under Review" | "Confirmed" | "Dismissed" | "Resolved";
  aiSummary: string; // narrative paragraph
  evidence: Array<{ label: string; value: string }>; // key/value rows
}

export interface SavingsSummary {
  ytdRealized: number;
  identified: number;
  breakdown: Array<{ label: string; amount: number }>;
}

export default function VigilantController(props: VigilantControllerProps): JSX.Element;
```

**Page composition (matches `ux-vigilant-controller.md`):**

1. Page header: title + subtitle. **No primary action button** — the page is reactive, not user-initiated.
2. `<KpiRow>` with 4 `<KpiCard>`.
3. Main content: two-column layout `grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6` (roughly 70/30 at lg+).
4. **Left column — Anomaly Feed:** `<Card>` with header containing "Anomaly Feed" + finding count (e.g. "12 findings") + `<HelpTooltip>` explaining severity scale. Body is a flat list of finding rows.

   Each row (default state):
   - First line: title (left, medium weight) + status `<Badge>` (right, variant chosen by status).
   - Second line: severity label (color-coded — Critical `text-destructive font-semibold`, High `text-amber-700 font-semibold`, Medium `text-foreground`, Low `text-muted-foreground`), dollar impact (bold tabular-nums), finding type, detected date.
   - Click to expand inline detail.

5. **Right column — Savings Summary sidebar:** `<Card>` with:
   - "YTD Realized" — large headline `text-3xl tabular-nums`, label `text-[10px] uppercase tracking-wider text-muted-foreground`.
   - "Identified" — secondary `text-xl tabular-nums` + label.
   - `<HelpTooltip>` next to "Identified" explaining Realized vs Identified.
   - "Breakdown by Type" — list of label + amount rows with `border-t border-border` hairline dividers.

**Click-to-expand inline triage (the marquee interaction):**

State: `expandedId: string | null`.

When a row is expanded:
- All other rows dim to `opacity-40` via a class derived from `expandedId !== row.id && expandedId !== null`.
- The expanded row remains full opacity.
- The detail panel renders directly below the selected row, inset from edges (`mx-4 p-4 bg-muted/40 rounded-md border-l-2 border-primary`).
- Detail panel content:
  1. **AI Summary** — `<AiCallout variant="subtle">` with the finding's `aiSummary` paragraph.
  2. **Evidence grid** — two-column key/value list. Labels: `text-[10px] uppercase tracking-wider text-muted-foreground`. Values: normal text. Built from `finding.evidence`.
  3. **Action row** — three buttons left-to-right:
     - "Dismiss" — `<Button variant="outline">`. Updates row status to "Dismissed", collapses panel.
     - "Confirm Finding" — `<Button variant="outline" className="text-primary">`. Updates status to "Confirmed", collapses.
     - "Resolve" — `<Button>` (default = primary filled). Updates status to "Resolved", collapses.

Clicking the same row again collapses without changing status.

**Internal state (per framework spec §9):**

```ts
const [expandedId, setExpandedId] = useState<string | null>(null);
const [statusOverrides, setStatusOverrides] = useState<Record<string, Finding["status"]>>({});

function effectiveStatus(f: Finding): Finding["status"] {
  return statusOverrides[f.id] ?? f.status;
}

function applyAction(id: string, next: Finding["status"]): void {
  setStatusOverrides((prev) => ({ ...prev, [id]: next }));
  setExpandedId(null);
}
```

The findings array from props is never mutated; status overrides layer on top. This keeps the source data stable while letting the demo feel responsive.

### Acceptance criteria

- [ ] `components/tools/vigilant-controller.tsx` exists. Default-exports `VigilantController`, named-exports `VigilantControllerProps` and `Finding`.
- [ ] No new files in `components/ui/*` or `components/tools/_shared.tsx`.
- [ ] File size ≤ 500 lines.
- [ ] `app/page.tsx` (or `app/vigilant/page.tsx`) renders a fully-mocked `<VigilantController ... />` with at least 6 findings of mixed severity/status for visual smoke testing.
- [ ] Clicking a finding row expands the detail panel below it; other rows dim to 40% opacity.
- [ ] Clicking the same row again collapses without changing status.
- [ ] "Dismiss" / "Confirm Finding" / "Resolve" each update the row's status badge in place and collapse the panel.
- [ ] Reload resets all status overrides (no persistence).
- [ ] `<HelpTooltip>` appears next to the Anomaly Feed header and the Identified line in the sidebar.
- [ ] No `lucide-react`, no sparkle/wand iconography, no `forwardRef`.
- [ ] `npm run build` succeeds with no type errors.

### Dependencies & risks

**Dependencies:**
- Plan #1 must merge first (`_shared.tsx` + all base primitives — `card`, `badge`, `button`).
- Plan #2 is **not** a dependency. This plan can ship in parallel with or after plan #2.
- No new npm packages.

**Risks:**
- *Dim-others interaction conflict with hover states.* When dimmed rows are hovered, hover styles should not "wake them up." Apply dim opacity at the row container level and ensure hover styles only apply when `!isDimmed`.
- *Long detail panels pushing content down.* AI summaries can be 2-3 sentences and evidence grids 6-8 rows. Acceptable — the page scrolls. Don't introduce virtualization.
- *Status taxonomy collision with shared Badge variants.* The five statuses (New / Under Review / Confirmed / Dismissed / Resolved) must each map to a distinct Badge variant. If `badge.tsx` doesn't expose enough variants, extend it inside this plan as a small one-line addition (not a full primitive change).

## Success metrics

- Demo prospect can scroll the feed, expand any finding, take any of three actions, and see the row's badge change immediately.
- Reload returns the page to a clean state.

## References

- Framework spec: `docs/superpowers/specs/2026-05-08-tools-framework-design.md`
- Plan #1 (must merge first): `plans/quoting-tool-implementation.md`
- UX reference: `C:\Users\matte_uea9zx9\website-demo\docs\ux-vigilant-controller.md`
- Existing reference patterns:
  - Status pill taxonomy: `templates/app/quoting/page.tsx:88-94`
  - Card composition: `templates/components/dashboards/manufacturing-primitives.tsx`
- Project memory:
  - `feedback_no_ai_cliches.md`
  - `feedback_branch_workflow.md`
