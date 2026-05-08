# Demo-Base Tools Framework — Design Spec

**Date:** 2026-05-08
**Branch:** `feat/tools-framework`
**Status:** Approved (brainstorm), ready for implementation planning
**Scope:** Establishes the conventions, shared layer, V0 wiring contract, and UI-primitive expansion plan for `components/tools/*`. Does **not** spec individual tools — each tool gets its own design doc.

---

## 1. Background

`rosedale-demo-base` is the canonical template repo that the Demo Creator pipeline (in `rosedale-os`) forks per prospect via V0. Today V0 generates each tab page from scratch using shadcn primitives, which means demos are static (buttons look enabled but do nothing). To unlock interactive demos, this repo will ship a small set of reusable, locked, highly opinionated **tool components** that V0 imports and configures with per-prospect mock data.

Four tools are already specified in UX reference docs (kept in `rosedale-os`):
- Quoting Tool
- Vigilant Controller (financial anomaly detection)
- Maintenance Intelligence
- Schedule PM (sub-tool of Maintenance Intelligence)

This spec defines how those four — and any future tools — are organized, wired up, and composed.

## 2. Goals

- Make adding a new tool a small, mechanical job: one file, one shape.
- Give V0 the smallest possible per-page surface (one import, one component, inline mock data).
- Keep tool styling and behavior consistent across demos by sharing the recurring UI elements (KPI cards, AI callouts, AI processing animations).
- Expand UI primitives only when a tool actually needs them — no speculative library work.
- Keep all tool source locked from V0 so per-demo generation can't deform the components.

## 3. Non-goals

- No tool-level persistence (no localStorage, no URL params, no backend).
- No global state (no Context, no Zustand, no Jotai).
- No per-tool theming — all tools consume the existing tokens in `app/globals.css`.
- No new top-level dependencies — work within the current `package.json` (Next 16, React 19, Tailwind 4, `radix-ui`, `recharts`, `@phosphor-icons/react`).
- No design system / Storybook — the four tool docs and this spec are the documentation.

## 4. Folder layout

```
components/
├── tools/
│   ├── _shared.tsx                      ← shared sub-components (Section 6)
│   ├── quoting-tool.tsx                 ← page-level tool
│   ├── vigilant-controller.tsx          ← page-level tool
│   ├── maintenance-intelligence.tsx     ← page-level tool, imports ↓
│   └── schedule-pm-modal.tsx            ← sub-tool, imported by maintenance-intelligence
└── ui/                                  ← shadcn-style primitives, expanded as needed
    ├── button.tsx     (existing)
    ├── separator.tsx  (existing)
    ├── tooltip.tsx    (existing)
    └── ...            (added when first tool that needs them is built)
```

All files under `components/tools/**` and `components/ui/**` are locked from V0 (covered by the existing `lockAllFiles: true` + 4-file unlock contract in `rosedale-os/lib/v0/generate.ts`).

## 5. Tool tiers

Two tiers of tool component, with different rules.

### 5.1 Page-level tools

A page-level tool default-exports a React component that V0 mounts directly at a tab route. It owns its full page composition: header (title + subtitle + optional primary action), KPI row, and main content.

V0's generated page file is the absolute minimum:

```tsx
// app/<tab-slug>/page.tsx (V0-generated)
import { ToolName } from "@/components/tools/<tool-name>";

export default function Page() {
  return <ToolName {...props} />;
}
```

V0 invents inline mock data for the props per prospect.

**Page-level tools (planned):**
- `quoting-tool.tsx`
- `vigilant-controller.tsx`
- `maintenance-intelligence.tsx`

### 5.2 Sub-tools

A sub-tool is mounted by a page-level tool, never directly by V0. It's still a single file under `components/tools/` and is still locked, but V0 has no awareness of it. The owning page tool imports it from a sibling path:

```tsx
// inside maintenance-intelligence.tsx
import { SchedulePmModal } from "./schedule-pm-modal";
```

**Sub-tools (planned):**
- `schedule-pm-modal.tsx` — owned by `maintenance-intelligence`

If a future tool turns out to be reusable across multiple page tools, it can be promoted to a page-level export (or remain a shared utility imported by multiple tools — same import path either way).

### 5.3 File size budget

Each tool — page-level or sub-tool — is one `.tsx` file. Aim ≤ ~600 lines including mock helpers, sub-components, and types. If a tool would exceed that budget, sub-components stay **inline at the bottom of the same file** (small named functions) rather than splitting across multiple files. The single-file-per-tool constraint is what keeps V0's import surface and our locking contract trivial.

## 6. Shared layer (`_shared.tsx`)

Single file. Exports named components consumed by all tools. Built incrementally — primitives land in this file as the first tool to need them is implemented.

| Export | First needed by | Description |
|---|---|---|
| `<KpiCard label value delta? sub? />` | quoting | Compact KPI tile: small label, large numeric value, optional `{ direction: "up" \| "down", amount }` delta, optional sub-label. |
| `<KpiRow>{...4 cards}</KpiRow>` | quoting | Responsive grid wrapper: 4-up at lg, 2-up at md, 1-up at sm. |
| `<AiChip />` | quoting | Small uppercase "AI" text in primary color. Used inline next to AI-flagged items and as the marker inside `<AiCallout />`. **No sparkle iconography anywhere.** |
| `<AiCallout title body action? variant="default" \| "banner" \| "subtle" />` | quoting | Recommendation block. `variant="banner"` = full-width, primary background, white text. `variant="subtle"` = soft inset bg + accent left border. `variant="default"` = card. The `<AiChip />` lives in the corner; no other AI iconography. |
| `<AiProcessingSteps steps={[{label, status}]} />` | quoting | Animated checklist for Step-2 processing modals. Statuses: `pending` (dimmed, neutral marker), `active` (pulsing primary-color dot — **no spinning sparkle**), `done` (checkmark, full opacity). The component is dumb — the parent tool drives the timing via state. |
| `<HelpTooltip>{markup}</HelpTooltip>` | quoting | Question-mark icon + tooltip; composes the existing `tooltip.tsx` primitive. |

**Conventions:**
- All shared components are pure: props in, JSX out. No data fetching. No side effects beyond local animation state where needed.
- Style with existing CSS variables (`--primary`, `--muted`, `--card`, `--accent`, etc.) — never hardcoded colors.
- No external icon set tied to "AI" — we use the `<AiChip />` text chip instead.

## 7. UI primitive expansion plan

`components/ui/` currently has `button.tsx`, `separator.tsx`, `tooltip.tsx`. Reading the four tool docs, these primitives are needed:

| Primitive | First needed by | Also used by |
|---|---|---|
| `card.tsx` | quoting (KPI cards, panels) | all tools |
| `badge.tsx` | quoting (status icon+label) | vigilant, maintenance |
| `input.tsx` + `label.tsx` | quoting (RFQ form) | schedule-pm |
| `toggle-group.tsx` | quoting (Urgency pills) | schedule-pm (×3) |
| `checkbox.tsx` | quoting (certifications) | schedule-pm (PM checklist) |
| `dialog.tsx` | quoting (modal shell) | schedule-pm |
| `select.tsx` | schedule-pm (Machine, Duration) | future tools |
| `slider.tsx` | quoting (margin slider) | — |
| `progress.tsx` | quoting (margin bar) | maintenance (spindle hours) |

**Authoring rules:**
- Hand-rolled in shadcn style on top of `radix-ui` (already installed). Match the patterns in the existing `button.tsx` / `separator.tsx` / `tooltip.tsx` files.
- Each primitive is added as part of the spec for the **first** tool that needs it — not pre-built in a separate batch. This keeps primitives co-evolving with real usage.
- All primitives are locked from V0.

## 8. V0 contract

### 8.1 What V0 writes

For each tool tab, V0 generates a single page file with one import and one component invocation. Example:

```tsx
// app/maintenance/page.tsx (V0-generated)
import { MaintenanceIntelligence } from "@/components/tools/maintenance-intelligence";

export default function Page() {
  return (
    <MaintenanceIntelligence
      title="Maintenance Intelligence"
      subtitle="AI-monitored fleet health and PM scheduling"
      kpis={[
        { label: "Machine Uptime", value: "94.2%", delta: { direction: "up", amount: "1.4 pts" } },
        { label: "Overdue PMs", value: "3", sub: "across 2 lines" },
        { label: "Scheduled This Month", value: "11" },
        { label: "Downtime Avoided", value: "$48,200", sub: "YTD" },
      ]}
      machines={[
        { id: "CNC-04", name: "Haas VF-2", type: "3-axis mill", spindleHours: 412, spindleHoursThreshold: 500,
          healthScore: 78, vibration: "Attention", nextPmDate: "2026-05-12", openWorkOrders: 2, hoursQueued: 6 },
      ]}
      pmSchedule={[
        { machineId: "CNC-04", description: "Spindle bearing inspection", windowStart: "2026-05-12",
          windowEnd: "2026-05-13", durationHrs: 8, priority: "high", conflictsCount: 1, status: "scheduled" },
      ]}
    />
  );
}
```

### 8.2 What V0 does not do

These rules apply to **V0-generated code only** (the unlocked page file). Tool source files internally can and do import from `_shared.tsx`, `components/ui/*`, and sibling sub-tools — those imports live in locked files V0 never sees or edits.

- ❌ Never imports from `@/components/tools/_shared.tsx` from a generated page.
- ❌ Never imports from `@/components/ui/*` from a generated page.
- ❌ Never imports a sub-tool directly from a generated page.
- ❌ Never edits any file under `components/tools/**` or `components/ui/**` (locked).
- ❌ Never writes layout markup, page headers, KPI grids, or sub-component composition. The tool owns all of that.

### 8.3 Public surface of each page-level tool

Each page-level tool file exports two things:
1. **Default export**: the React component.
2. **Named type export**: the props interface (e.g. `MaintenanceIntelligenceProps`).

The `Props` interface is what the V0 system prompt references when instructing V0 how to call the tool. The downstream prompt update in `rosedale-os/lib/v0/prompts.ts` will:
- Map each `tool_type` from the GPT-5 Mini enrichment to a specific tool import path.
- Embed the props type for that tool inline in the system prompt.
- Instruct V0 to invent plausible client-specific mock data conforming to the type.

(That `rosedale-os` work is tracked separately — out of scope for this spec.)

## 9. Interactivity & state contract

### 9.1 State scope

- All interactive state lives inside the tool component (or its sub-tool children) via `useState` / `useReducer`. No global store. No URL params. No `localStorage`. No Context.
- Initial state derives entirely from props passed by V0. The tool seeds its internal state from props on mount; from then on, internal state is the source of truth.
- Page reload resets to fresh state from props. This is acceptable for a demo.

### 9.2 Per-tool state inventory

Captured here for completeness; each tool's own spec will refine.

| Tool | Internal state |
|---|---|
| `quoting-tool` | Selected filter tab; expanded row id; modal open + step (1\|2\|3) + form fields + margin slider value. |
| `vigilant-controller` | Expanded finding id; per-finding status overrides (Dismiss / Confirm / Resolve). |
| `maintenance-intelligence` | Modal open (from "Schedule PM"); appended PM entries when a modal confirm fires. |
| `schedule-pm-modal` | Step (1\|2\|3); form fields; checklist toggles. Modal owns this; the parent owns "is open." |

### 9.3 Animation timing

`<AiProcessingSteps />` is dumb. The parent tool drives state transitions via `setTimeout` (typical: 800–1500ms per step). The Step-2 modal phase completes in ~5s total, then auto-advances to Step 3. No external clock, no real async work.

### 9.4 Buttons and feedback

Every button in a tool advances local state visibly:
- "Save as Draft" flips the row's status pill to `Draft`.
- "Resolve" updates the finding's status badge and collapses the detail panel.
- "Confirm Schedule" appends a row to the PM Schedule Timeline and closes the modal.

No silent buttons. No toast-only feedback (a toast is fine, but never the only visible result).

## 10. Build order

Each tool is a separate brainstorm + spec + implementation cycle, in this order:

1. **`quoting-tool`** — first. Highest UI surface area: page composition + 3-step modal + slider + cost chart. Building it forces us to add 8 of the ~10 new UI primitives (card, badge, input, label, toggle-group, checkbox, dialog, slider, progress) and build the full shared layer (`KpiCard`, `KpiRow`, `AiChip`, `AiCallout`, `AiProcessingSteps`, `HelpTooltip`). After this tool ships, the remaining tools mostly compose existing primitives.
2. **`maintenance-intelligence` + `schedule-pm-modal`** — together, since the modal only exists in service of the page tool. Adds `select.tsx` if not yet present. Validates the page-tool / sub-tool composition pattern.
3. **`vigilant-controller`** — last. Lowest novel surface area: page + click-to-expand list + sidebar. Mostly reuses primitives. Validates the click-to-expand-with-dim-others interaction.

The shared layer (`_shared.tsx`) is built incrementally in step 1, then *consumed* in steps 2 and 3 without further expansion.

## 11. Out of scope (this spec)

- Per-tool UX specifics — covered by each tool's own design doc, brainstormed when its reference images are provided.
- The `rosedale-os` prompt update mapping `tool_type` → tool imports.
- The `rosedale-os` enrichment schema extension adding `tool_type` to `AiOpportunity`.
- Cleanup of `templates/app/quoting/page.tsx` and other now-redundant template references — to be evaluated after `quoting-tool` ships.
- Feature flags or backwards-compatibility for demos that pre-date the tool components.

## 12. Open questions

None at this time. The four tool reference docs in `rosedale-os` are the authoritative per-tool source.
