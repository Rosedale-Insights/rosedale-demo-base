# feat(tools): maintenance-intelligence + schedule-pm-modal — fleet PM scheduling

**Branch:** `feat/tools-framework`
**Framework spec:** `docs/superpowers/specs/2026-05-08-tools-framework-design.md`
**UX references:** (external — see `website-demo` repo)
- `docs/ux-maintenance-intelligence.md`
- `docs/ux-schedule-pm-tool.md`
**Depends on:** plan #1 (quoting-tool) — must merge first; this plan reuses `_shared.tsx` and most `components/ui/*` primitives.

## Overview

Build the second tool group: `maintenance-intelligence` (page-level) and its sub-tool `schedule-pm-modal`. Validates the page-tool / sub-tool composition pattern set up in the framework spec. Adds one new UI primitive (`select.tsx`); everything else is reuse.

## Problem statement

Maintenance is the second of three demo verticals to land. Per the framework spec build order, page-level tool 2 ships together with its only sub-tool because the modal exists solely in service of the maintenance page (the "Schedule PM" button is the only entry point).

## Proposed solution

Two single-file components under `components/tools/`:

- `maintenance-intelligence.tsx` — page-level tool (V0 mounts at a tab route).
- `schedule-pm-modal.tsx` — sub-tool, imported only by `maintenance-intelligence.tsx`. V0 never imports it directly.

Both locked. Both use `_shared.tsx` and existing UI primitives from plan #1.

V0's generated page:

```tsx
// app/maintenance/page.tsx (V0-generated)
import { MaintenanceIntelligence } from "@/components/tools/maintenance-intelligence";

export default function Page() {
  return (
    <MaintenanceIntelligence
      title="Maintenance Intelligence"
      subtitle="AI-monitored fleet health and PM scheduling"
      kpis={[/* 4 KPIs */]}
      machines={[/* mock machine objects */]}
      pmSchedule={[/* mock PM rows */]}
    />
  );
}
```

## Technical approach

### Architecture

Two layers land in this plan:

1. **`components/ui/select.tsx`** — one new primitive (machine + duration dropdowns).
2. **`components/tools/maintenance-intelligence.tsx`** + **`components/tools/schedule-pm-modal.tsx`** — the tool files.

No additions to `_shared.tsx`. No changes to existing primitives.

### Implementation phases

#### Phase 1 — `components/ui/select.tsx`

Hand-rolled shadcn-style on `radix-ui` (unified). Compose `Root`, `Group`, `Label`, `Value`, `Trigger`, `Content`, `Item`, `ItemText`, `ItemIndicator`, `Viewport`, `Portal`, `ScrollUpButton`, `ScrollDownButton`, `Separator`. Required gotchas:
- `Item` must contain `ItemText` (Radix uses it for typeahead and trigger display).
- Wrap content in `Portal` so it escapes overflow clipping inside `<Dialog>`.
- `Content` uses `position="popper"` with `data-[side=bottom]:translate-y-1` for offset.
- Trigger renders a chevron icon (Phosphor `CaretDown` size-4 weight="light"), `[&_svg]:shrink-0`.
- Animation: `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0` on Content.

Authoring pattern mirrors plan #1's primitives exactly (no `forwardRef`, `data-slot` on every part, named exports, `"use client"`).

#### Phase 2 — `schedule-pm-modal.tsx`

`"use client"`. Single file. Sub-tool. Default-exports `SchedulePmModal`, named-exports `SchedulePmModalProps`. **Not directly importable by V0** — only the parent maintenance-intelligence imports it.

**Public surface:**

```ts
export interface SchedulePmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machines: Array<{ id: string; name: string }>; // for the Machine dropdown
  onConfirm: (event: ScheduledPmEvent) => void; // parent appends to its pmSchedule
}

export interface ScheduledPmEvent {
  machineId: string;
  pmType: "Preventive" | "Predictive" | "Inspection";
  windowStart: string; // ISO date
  windowEnd: string; // ISO date
  durationLabel: "4 hrs" | "8 hrs" | "1 day" | "2 days";
  serviceProvider: "In-House" | "OEM" | "Third-Party";
}

export function SchedulePmModal(props: SchedulePmModalProps): JSX.Element;
```

**3-step state machine inside the modal** (`step: 1 | 2 | 3`):

- **Step 1 — Configure PM:** `<Select>` Machine, `<ToggleGroup type="single">` PM Type, two date `<Input type="date">` Start/End side-by-side, `<Select>` Duration, `<ToggleGroup type="single">` Service Provider. Footer: "Analyze Schedule" primary button → advances to Step 2.
- **Step 2 — AI processing:** `<AiProcessingSteps>` with four steps ("Checking production schedule", "Identifying job conflicts", "Evaluating rerouting options", "Calculating cost impact"). Same `setTimeout` cadence as quoting-tool's Step 2. Auto-advance on completion.
- **Step 3 — PM Analysis Review:** Top: full-width `<AiCallout variant="default">` with narrative paragraph. Two-column body:
  - **Left (Jobs Affected):** mini-table with columns Job ID, Customer, Delay (days), Reroute. Reroute availability shown as green/red text. If empty, render "None" centered.
  - **Right (Cost Summary + PM Checklist):** three-row cost summary (Planned PM Cost, Unplanned Downtime Risk in destructive red, Total Delay row with `bg-primary text-primary-foreground`). PM Checklist below: list of `<Checkbox>` items with crossed-out label state when checked.

  Footer: "← Try Different Window" (ghost link → resets to Step 1), "Confirm Schedule" (primary → fires `onConfirm` with the assembled event, then closes modal).

**Mock data:** Step-3 jobs-affected list and cost figures are generated from a small internal helper based on the Step-1 form state (e.g. derive job count from window length). PM Checklist items are a hardcoded list inside the modal (spindle bearing inspection, lubrication check, axis alignment verification, runout calibration, coolant flush).

#### Phase 3 — `maintenance-intelligence.tsx`

`"use client"`. Single file. Page-level tool. Default-exports `MaintenanceIntelligence`, named-exports `MaintenanceIntelligenceProps`. Imports `./schedule-pm-modal` as a sibling.

**Public surface:**

```ts
export interface MaintenanceIntelligenceProps {
  title: string;
  subtitle: string;
  kpis: [KpiSpec, KpiSpec, KpiSpec, KpiSpec];
  machines: MachineCard[];
  pmSchedule: PmRow[];
}

export interface MachineCard {
  id: string;
  name: string;
  type: string;
  spindleHours: number;
  spindleHoursThreshold: number;
  healthScore: number; // 0–100
  vibration: "Normal" | "Attention" | "Alarm";
  nextPmDate: string;
  openWorkOrders: number;
  hoursQueued: number;
}

export interface PmRow {
  machineId: string;
  description: string;
  windowStart: string;
  windowEnd: string;
  durationHrs: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  conflictsCount: number;
  status: "Overdue" | "In Progress" | "Scheduled" | "Completed";
}

export default function MaintenanceIntelligence(props: MaintenanceIntelligenceProps): JSX.Element;
```

**Page composition (matches `ux-maintenance-intelligence.md`):**

1. Page header: title + subtitle + "Schedule PM" primary button top-right.
2. `<KpiRow>` with 4 `<KpiCard>`.
3. **PM Schedule Timeline** — table sorted by urgency (Overdue → In Progress → Scheduled → Completed). Columns: Machine ID, Description, Window (date range formatted "May 12 – May 13"), Duration, Priority, Conflicts, Status. Status as `<Badge variant="...">` per state. Priority as text-only with color/weight (Critical = `text-destructive font-semibold`, High = `text-primary font-semibold`, Medium = `text-foreground`, Low = `text-muted-foreground`). Conflicts: non-zero in destructive red, zero as muted "None". `<HelpTooltip>` in the table header explaining columns + PM type taxonomy.
4. **Machine Health Grid** — `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` of `<Card>` per machine. Each card: header (id + name bold, type muted), `<Progress>` for spindle hours (fill colored by ratio: emerald < 0.7, amber 0.7–0.9, rose ≥ 0.9), metrics row (Health Score numeric + Vibration label colored by status — Alarm `text-destructive`, Attention `text-amber-600`, Normal `text-emerald-700`), footer row (Next PM date + open work order count + hours queued). Read-only; no clicks.

**State (per framework spec §9):**

```ts
const [pmModalOpen, setPmModalOpen] = useState(false);
const [appendedPms, setAppendedPms] = useState<PmRow[]>([]);
const allPms = [...props.pmSchedule, ...appendedPms].sort(byUrgency);
```

`<SchedulePmModal>` mounted with `open={pmModalOpen}`; `onConfirm` appends to `appendedPms` with `status: "Scheduled"`.

### Acceptance criteria

- [ ] `components/ui/select.tsx` exists, follows the existing primitive authoring pattern, supports use inside Dialog (Portal works correctly).
- [ ] `components/tools/schedule-pm-modal.tsx` exists, default-exports `SchedulePmModal`, named-exports `SchedulePmModalProps` and `ScheduledPmEvent`.
- [ ] `components/tools/maintenance-intelligence.tsx` exists, default-exports `MaintenanceIntelligence`, named-exports `MaintenanceIntelligenceProps`.
- [ ] V0 has no path that imports `schedule-pm-modal` directly — only `maintenance-intelligence.tsx` imports it via relative `./schedule-pm-modal`.
- [ ] Both files ≤ 600 lines including inline sub-components.
- [ ] `app/page.tsx` (or a new `app/maintenance/page.tsx` for visual testing) renders a fully-mocked `<MaintenanceIntelligence ... />` for `npm run dev` smoke testing.
- [ ] Clicking "Schedule PM" opens the modal at Step 1.
- [ ] Step-2 animation auto-advances to Step 3 in ~5s.
- [ ] "Confirm Schedule" appends a new row to the PM Schedule Timeline table with `status: Scheduled` and closes the modal.
- [ ] "← Try Different Window" returns to Step 1 with prior form fields intact (no reset).
- [ ] PM Checklist checkboxes toggle and the checked label state shows as crossed-out (`line-through` + `text-muted-foreground`).
- [ ] No `lucide-react`, no sparkle/wand iconography, no `forwardRef`.
- [ ] `npm run build` succeeds with no type errors.

### Dependencies & risks

**Dependencies:**
- Plan #1 must merge first (`_shared.tsx`, `dialog`, `input`, `label`, `toggle-group`, `checkbox`, `progress`, `card`, `badge`).
- No new npm packages.

**Risks:**
- *`<Select>` inside `<Dialog>` portal stacking.* Both use Portal. Ensure `select.tsx` renders to a Portal so the dropdown isn't clipped by Dialog content. Test specifically inside the Step-1 form.
- *Date input cross-browser styling.* Native `<Input type="date">` has variable appearance across browsers. Acceptable for demo; document the limitation. Don't introduce a date-picker primitive in this plan.
- *Dummy data in Step-3 derived from Step-1.* If derivation is too thin (always shows the same numbers regardless of window), the modal feels canned. Mitigate by varying the Jobs Affected list length and Total Delay value based on `windowEnd - windowStart` and machine ID.

## Success metrics

- Demo prospect can click through the maintenance flow end-to-end without dead-ends.
- Confirmed PM appears in the timeline immediately and persists for the rest of the session (until reload).

## References

- Framework spec: `docs/superpowers/specs/2026-05-08-tools-framework-design.md`
- Plan #1 (must merge first): `plans/quoting-tool-implementation.md`
- UX references:
  - `C:\Users\matte_uea9zx9\website-demo\docs\ux-maintenance-intelligence.md`
  - `C:\Users\matte_uea9zx9\website-demo\docs\ux-schedule-pm-tool.md`
- Existing reference compositions:
  - `templates/app/shop-floor/page.tsx` (status pill taxonomy, timeline patterns, Machine Health card composition)
  - `templates/components/dashboards/manufacturing-primitives.tsx` (status dot + pill + canonical KPI tile)
- Project memory:
  - `feedback_no_ai_cliches.md`
  - `feedback_branch_workflow.md`
