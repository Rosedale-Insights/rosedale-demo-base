# feat(tools): loosen hardcoded defaults for V0 flexibility

**Branch:** `feat/tools-framework` (stay on current branch)
**Context:** The tool components landed in recent commits work well for manufacturing demos, but several have domain-specific values baked into component logic rather than exposed as props. This forces V0 to fork and rewrite components instead of importing and configuring them. This plan lifts those values to optional props with the current values as defaults — zero breaking changes, purely additive.

## Problem statement

V0 generates demo pages by importing tool components and passing client-specific mock data as props. Three components currently have hardcoded arrays/constants that V0 cannot override without editing the component source:

1. **`schedule-pm-modal.tsx`** — 6 hardcoded constants (PM types, durations, providers, processing labels, checklist items, customer/machine pools for mock generation)
2. **`quoting-tool.tsx`** — 5 hardcoded defaults (cost breakdown, operations, similar jobs, AI narrative, processing step labels) that are manufacturing-specific fallbacks
3. **`app/page.tsx`** — hardcoded 3-tool card grid that doesn't adapt to demos with 2 or 5 tools

## Proposed solution

Lift every hardcoded domain-specific constant to an optional prop on the relevant component, keeping the current values as defaults. No behavior changes for existing consumers. V0 can then override any subset.

## Technical approach

### Phase 1 — `schedule-pm-modal.tsx` (highest priority)

**Current state:** 6 constants at `schedule-pm-modal.tsx:56-84` are module-level and not configurable:

```
PM_TYPES          line 56    ["Preventive", "Predictive", "Inspection"]
DURATIONS         line 57    ["4 hrs", "8 hrs", "1 day", "2 days"]
PROVIDERS         line 58    ["In-House", "OEM", "Third-Party"]
PROCESSING_LABELS line 60-65 ["Checking production schedule", ...]
PM_CHECKLIST      line 67-73 ["Spindle bearing inspection", ...]
CUSTOMER_POOL     line 75-82 ["Aerospace Dynamics", ...]
REROUTE_POOL      line 84    ["CNC-01", "CNC-02", ...]
```

**Changes to `SchedulePmModalProps`** (line 47-52):

Add optional fields — all default to the current constants when omitted:

```ts
export interface SchedulePmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machines: Array<{ id: string; name: string }>
  onConfirm: (event: ScheduledPmEvent) => void
  // --- new optional overrides ---
  pmTypes?: string[]
  durations?: string[]
  serviceProviders?: string[]
  processingLabels?: string[]
  checklistItems?: string[]
  customerPool?: string[]
  reroutePool?: string[]
}
```

**Implementation:**
- Destructure new props with defaults in the component function signature (line 200-205):
  ```ts
  export default function SchedulePmModal({
    open, onOpenChange, machines, onConfirm,
    pmTypes = PM_TYPES,
    durations = DURATIONS,
    serviceProviders = PROVIDERS,
    processingLabels = PROCESSING_LABELS as unknown as string[],
    checklistItems = PM_CHECKLIST as unknown as string[],
    customerPool = CUSTOMER_POOL,
    reroutePool = REROUTE_POOL,
  }: SchedulePmModalProps) {
  ```
- Pass `customerPool` and `reroutePool` into `deriveAffectedJobs` (line 127) — add them as parameters instead of using module-level constants.
- Pass `checklistItems` into `ReviewBody` (line 307) instead of referencing `PM_CHECKLIST` directly.
- Pass `processingLabels` into the step-building code (line 260).
- The `ConfigureForm` sub-component (line 351) already receives `machines` as a prop; also pass `pmTypes`, `durations`, `serviceProviders` and use them in the `ToggleGroup` / `Select` renders (lines 383-450).

**Type loosening:** The current types `PmType`, `PmDuration`, `PmServiceProvider` are narrow unions (line 34-36). Widen the `ScheduledPmEvent` to use `string` for `pmType`, `durationLabel`, and `serviceProvider` so V0 can pass custom values (e.g. `"Calibration"`, `"3 days"`, `"Contractor"`). Keep the existing union types exported for consumers who want them but don't enforce them in the event interface:

```ts
export interface ScheduledPmEvent {
  machineId: string
  pmType: string
  windowStart: string
  windowEnd: string
  durationLabel: string
  serviceProvider: string
}
```

**Also update:** `deriveAffectedJobs` (line 127) and `deriveCostSummary` (line 144) to accept `customerPool`/`reroutePool` parameters. The `typeMultiplier` and `durationCost` lookups (lines 151-161) should fall back to a sensible default (multiplier 1.0, cost based on duration string parsing) for unknown custom values.

### Phase 2 — `quoting-tool.tsx` (medium priority)

**Current state:** 5 fallback constants at `quoting-tool.tsx:122-151`:

```
DEFAULT_COST_BREAKDOWN   line 122-127  Manufacturing cost categories
DEFAULT_OPERATIONS       line 129-134  CNC operations (Setup/Roughing/Finishing/Inspection)
DEFAULT_SIMILAR_JOBS     line 136-140  Aerospace/metalworks companies
DEFAULT_AI_NARRATIVE     line 143-144  Ti-6Al-4V reference
STEP_LABELS              line 146-151  ["Analyzing material costs", ...]
```

These are already partially addressed — `QuoteBuilderPresets` (line 72-82) accepts `costBreakdown`, `operations`, `similarJobs`, `aiNarrative`. But `STEP_LABELS` (the animated processing sequence) has no override path.

**Changes to `QuotingToolProps`** (line 84-93):

```ts
export interface QuotingToolProps {
  title: string
  subtitle: string
  kpis: [KpiSpec, KpiSpec, KpiSpec, KpiSpec]
  quotes: QuoteRow[]
  lineItemPresets?: QuoteBuilderPresets
  aiBannerHeadline: string
  aiBannerBody: string
  aiBannerActionLabel?: string
  // --- new ---
  processingLabels?: string[]
}
```

**Implementation:**
- Destructure `processingLabels = STEP_LABELS as unknown as string[]` in the component.
- Pass to the modal's step-2 builder instead of referencing the module constant.

**Also:** Add `baseUnitCost` to the defaults comment so V0 knows it exists — it's already in the `QuoteBuilderPresets` interface (line 82) but easy to miss.

### Phase 3 — `app/page.tsx` (lower priority)

**Current state:** Hardcoded `tools` array (line 5-39) with exactly 3 entries. The grid is `sm:grid-cols-2 lg:grid-cols-3` (line 50).

**Problem:** A demo with 2 tools or 4+ tools either has a visual gap or needs a page rewrite.

**Solution:** Extract the tool-card data into a shared config that `nav-config.ts` can also reference, or accept it from a parent. Two options:

**Option A (simpler, recommended):** Add a `toolCards` config alongside `nav-config.ts`:

Create `app/components/layout/tool-cards-config.ts`:
```ts
import { Receipt, Wrench, ShieldCheck, type Icon } from "@phosphor-icons/react";

export interface ToolCard {
  href: string
  icon: Icon
  title: string
  description: string
  stats: Array<{ label: string; value: string }>
}

// V0 replaces this array per demo with the client's actual tool cards.
export const toolCards: ToolCard[] = [
  {
    href: "/quoting",
    icon: Receipt,
    title: "Quoting",
    description: "AI-assisted quote drafting and pipeline tracking",
    stats: [
      { label: "Win rate", value: "64.2%" },
      { label: "Pipeline", value: "$1.8M" },
      { label: "Open quotes", value: "12" },
    ],
  },
  // ... existing entries
];
```

Update `app/page.tsx` to import from this config and make the grid responsive to card count:
```tsx
import { toolCards } from "./components/layout/tool-cards-config";

// Responsive grid that works for 2-6 cards
<div className={cn(
  "grid gap-4 sm:grid-cols-2",
  toolCards.length >= 3 && "lg:grid-cols-3"
)}>
```

**Option B (derive from nav-config):** Extend `NavLeaf` with optional `description` and `stats` fields, then derive the home page cards from `primaryNav` (filtering out Home and Settings). This is DRYer but couples the nav and home page — if V0 wants a nav item without a home card (or vice versa), it creates friction. Not recommended.

### Summary of changes

| File | Change | Lines affected |
|------|--------|---------------|
| `components/tools/schedule-pm-modal.tsx` | Add 7 optional props, widen event types, pass pools into helpers | Props interface, component signature, `deriveAffectedJobs`, `deriveCostSummary`, `ConfigureForm`, `ReviewBody` |
| `components/tools/quoting-tool.tsx` | Add `processingLabels?: string[]` prop | Props interface, component signature, modal step-2 |
| `app/page.tsx` | Import from extracted config, responsive grid | Lines 1-50 |
| `app/components/layout/tool-cards-config.ts` | **New file** — extracted tool card data | ~40 lines |

## Acceptance criteria

- [ ] `SchedulePmModalProps` accepts optional `pmTypes`, `durations`, `serviceProviders`, `processingLabels`, `checklistItems`, `customerPool`, `reroutePool`.
- [ ] Omitting all new props produces identical behavior to current code (backward compatible).
- [ ] `ScheduledPmEvent` uses `string` (not narrow unions) for `pmType`, `durationLabel`, `serviceProvider`.
- [ ] `QuotingToolProps` accepts optional `processingLabels`.
- [ ] Home page renders correctly with 2, 3, or 4 tool cards (adjust the config to test).
- [ ] `tool-cards-config.ts` has a `// V0 replaces this` comment consistent with `nav-config.ts`.
- [ ] No new npm dependencies.
- [ ] `npm run build` succeeds with no type errors.
- [ ] Existing page routes (`/quoting`, `/maintenance`, `/vigilant`) behave identically after changes.

## Dependencies & risks

**Dependencies:** None — all changes are to files that already exist on this branch.

**Risks:**
- *Type widening on `ScheduledPmEvent`.* The parent `maintenance-intelligence.tsx` consumes `onConfirm`'s event to build a `PmRow`. Verify that `PmRow` doesn't narrow-type on `pmType` etc. — it uses `string` for `description` so this should be fine, but check.
- *`deriveCostSummary` lookup tables.* When custom PM types or durations are passed, the `Record<PmType, number>` and `Record<PmDuration, number>` lookups will miss. Add fallback entries: `typeMultiplier` defaults to `1`, `durationCost` parses the numeric prefix of the duration string or defaults to `2400`.
- *Home page card count.* The grid handles 1-3 naturally with `sm:grid-cols-2 lg:grid-cols-3`. For 4+ cards, the 3-column layout wraps cleanly. For exactly 1 card, the single-column is acceptable for a minimal demo.

## What this plan does NOT change

- No changes to `_shared.tsx`, UI primitives, or the shell layout.
- No changes to `vigilant-controller.tsx` — it's already flexible enough (all domain data comes from props, status/severity taxonomies are generic).
- No changes to `maintenance-intelligence.tsx` page component — its rigidity is in the sub-tool modal, which this plan addresses.
- No visual or behavioral changes for any existing page when the new props are omitted.

## References

- Current tool implementations reviewed in conversation above
- `schedule-pm-modal.tsx:56-84` — the 6 hardcoded constants
- `quoting-tool.tsx:122-151` — the 5 fallback defaults
- `app/page.tsx:5-39` — the hardcoded tools array
- `nav-config.ts:23-29` — existing pattern for "V0 replaces this"
