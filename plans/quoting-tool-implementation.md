# feat(tools): quoting-tool — interactive quoting page + 3-step Quote Builder modal

**Branch:** `feat/tools-framework` (already created)
**Framework spec:** `docs/superpowers/specs/2026-05-08-tools-framework-design.md`
**UX reference:** `C:\Users\matte_uea9zx9\website-demo\docs\ux-quoting-tool.md`
**Related:** plan #2 (maintenance + schedule-pm) and plan #3 (vigilant-controller) reuse the shared layer + UI primitives this plan builds.

## Overview

Build the first tool in `components/tools/`: a fully-interactive quoting page that V0 can mount at any tab route by passing inline mock data. Building this tool also lands the entire shared layer (`_shared.tsx`) and 8 of the ~10 new `components/ui/*` primitives — the heaviest plan of the three.

## Problem statement

V0 currently generates each tab page from scratch with shadcn primitives, producing static mockups where buttons "look enabled but do nothing." This blocks demos that need to feel like real software (forms that submit, modals that step, sliders that recalc). Per the framework spec, we ship locked, reusable interactive components that V0 imports and configures with mock data — starting with the heaviest one to validate the framework.

## Proposed solution

Single-file tool at `components/tools/quoting-tool.tsx` (≤600 lines). Default-exports `QuotingTool`, named-exports `QuotingToolProps`. Owns its full page composition (header + KPI row + filter tabs + table + AI banner) and the 3-step modal (RFQ form → AI processing → Quote review with margin slider). All state local. No persistence.

V0's generated page becomes:

```tsx
// app/quoting/page.tsx (V0-generated)
import { QuotingTool } from "@/components/tools/quoting-tool";

export default function Page() {
  return (
    <QuotingTool
      title="Quoting Tool"
      subtitle="AI-assisted quote drafting and pipeline tracking"
      kpis={[/* 4 KPI objects */]}
      quotes={[/* mock quote rows */]}
      lineItemPresets={{/* per-industry mock seed data for the modal */}}
      aiBannerHeadline="..."
      aiBannerBody="..."
    />
  );
}
```

## Technical approach

### Architecture

Three layers land in this plan:

1. **`components/ui/*`** — 8 new shadcn-style primitives, hand-rolled on `radix-ui` (unified package).
2. **`components/tools/_shared.tsx`** — shared sub-components used by all 4 future tools.
3. **`components/tools/quoting-tool.tsx`** — the tool itself, composing layers 1 and 2.

All three layers are locked from V0.

### Implementation phases

#### Phase 1 — UI primitives (8 new files in `components/ui/`)

Mirror the existing `button.tsx` / `separator.tsx` / `tooltip.tsx` authoring pattern exactly:
- Namespace import: `import { X as XPrimitive } from "radix-ui"`
- No `forwardRef` (React 19); refs come through as props
- Every root element gets `data-slot="<name>"`
- `cn()` from `@/lib/utils` for class composition
- `cva` only when there are real visual axes (Badge, ToggleGroup); no cva for plain primitives
- Named exports only; no default exports
- `"use client"` only when interactive (most of these)

Files to create:

| File | Radix base | Notes |
|---|---|---|
| `components/ui/card.tsx` | none (plain DOM) | Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`. Header is grid so action can `col-start-2 row-span-2 self-start justify-self-end`. |
| `components/ui/badge.tsx` | optional `Slot` for `asChild` | `cva` with `variant: default \| secondary \| destructive \| outline \| muted`. Status pill colors use the established `bg-{emerald\|amber\|sky\|rose\|muted}-50 text-*-700` taxonomy from templates. |
| `components/ui/input.tsx` | none | Single base. Includes `aria-invalid:border-destructive aria-invalid:ring-destructive/20`, `disabled:cursor-not-allowed disabled:opacity-50`, file-input selectors. |
| `components/ui/label.tsx` | `Label` | Wraps `LabelPrimitive.Root`. Adds `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`. |
| `components/ui/toggle-group.tsx` | `ToggleGroup` | Discriminated `type: "single" \| "multiple"`. Pill-button style: active item fills with `bg-primary text-primary-foreground`, inactive `bg-muted/40 hover:bg-muted`. Context propagates size/variant from Root to Item. |
| `components/ui/checkbox.tsx` | `Checkbox` | `Root` + `Indicator` containing a Phosphor `Check` icon (size-3.5, weight="bold"). State-based styling via `data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground`. |
| `components/ui/dialog.tsx` | `Dialog` | Compose `Root, Trigger, Portal, Overlay, Content, Header, Footer, Title, Description, Close`. `DialogContent` wraps `Portal` + `Overlay` + `Content` and renders a default close button (overridable via `showCloseButton: boolean`). Animation classes: `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95` + `data-[state=closed]:*` mirrors. **Required:** consumers must always render a `DialogTitle` (use `VisuallyHidden` from `radix-ui` for hidden titles) — Radix throws a console error otherwise. |
| `components/ui/slider.tsx` | `Slider` | `Root` + `Track` + `Range` + `Thumb`. Render one `Thumb` per value in `value ?? defaultValue ?? [min, max]`. Each thumb gets `focus-visible:ring-ring/50 focus-visible:ring-[3px]`. Pass through `aria-label`. |
| `components/ui/progress.tsx` | `Progress` | `Root` + `Indicator` with `style={{ transform: \`translateX(-${100-(value ?? 0)}%)\` }}`. Default `value` to `0`. Add `transition-all` on indicator. |

`select.tsx` is **not** built in this plan — quoting tool uses inputs and toggle-groups, not selects. Plan #2 will add it.

`dialog.tsx` and the form primitives all need `"use client"`. `card.tsx` and `badge.tsx` do not.

#### Phase 2 — Shared layer (`components/tools/_shared.tsx`)

Single file, named exports. **No sparkle iconography anywhere** (project memory):

```ts
export function KpiCard({ label, value, delta, sub }: KpiCardProps): JSX.Element;
export function KpiRow({ children }: { children: React.ReactNode }): JSX.Element;
export function AiChip(): JSX.Element; // small uppercase "AI" text in primary color
export function AiCallout(props: AiCalloutProps): JSX.Element; // variant: "default" | "banner" | "subtle"
export function AiProcessingSteps({ steps }: { steps: ProcessingStep[] }): JSX.Element;
export function HelpTooltip({ children }: { children: React.ReactNode }): JSX.Element;
```

Implementation notes:
- `KpiCard` mirrors the canonical KPI tile from `templates/components/dashboards/manufacturing-primitives.tsx:29-56`: `bg-card border border-border rounded-xl p-4`, label `text-xs text-muted-foreground`, value `text-2xl tabular-nums`, delta as inline triangle SVG (the existing `#6b8f71` / `#b05a5a` are the only hardcoded hex values in scope).
- `KpiRow` is a responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
- `AiChip` is a `<span>` with `text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded` — no icon.
- `AiCallout` variants:
  - `default`: `bg-card border border-border rounded-xl p-4` with `<AiChip />` top-left.
  - `banner`: `bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4` — high-contrast, full-width, optional action button on the right. The "AI" chip is white-on-translucent.
  - `subtle`: `bg-muted/40 border-l-2 border-primary rounded-md p-4` — used inside expanded rows / modals.
- `AiProcessingSteps` renders a vertical list. Each step has `pending` (dim, neutral dot), `active` (primary-color filled circle with a CSS keyframe pulse — no spinner ring, no icon), `done` (Phosphor `Check` size-4 weight="bold"). Component is dumb; parent drives state transitions on `setTimeout`.
- `HelpTooltip` composes `components/ui/tooltip.tsx` + a Phosphor `Question` icon size-3.5 weight="light" with `text-muted-foreground hover:text-foreground` cursor-help.

`"use client"` at top of file (animation requires it).

#### Phase 3 — `quoting-tool.tsx`

Single file at `components/tools/quoting-tool.tsx`. `"use client"`. Sub-components inline at the bottom of the file. Target ≤600 lines.

**Public surface:**

```ts
export interface QuotingToolProps {
  title: string;
  subtitle: string;
  kpis: [KpiSpec, KpiSpec, KpiSpec, KpiSpec]; // exactly 4
  quotes: QuoteRow[];
  lineItemPresets?: QuoteBuilderPresets; // optional mock seed for the modal
  aiBannerHeadline: string;
  aiBannerBody: string;
  aiBannerActionLabel?: string;
}

export interface QuoteRow {
  id: string;
  client: string;
  quoteId: string;
  project: string;
  amount: number;
  margin: number; // 0–100
  confidence: number; // 0–100
  status: "Draft" | "Review" | "Sent" | "Won" | "Lost" | "Expired";
}

export default function QuotingTool(props: QuotingToolProps): JSX.Element;
```

**Page composition (matches `ux-quoting-tool.md`):**

1. Page header: `<h1 className="text-2xl">{title}</h1>`, subtitle `text-sm text-muted-foreground`, primary "New Quote" button top-right (opens modal).
2. `<KpiRow>` with 4 `<KpiCard>` from props.
3. Filter tabs row (All / Draft / Review / Sent / Won / Lost / Expired) using `<Button size="sm" variant={active ? "outline" : "ghost"}>` per the established template pattern, plus `<HelpTooltip>` icon at the end explaining margin vs. confidence.
4. Quote table: header row + body rows, click-to-expand inline detail panel (accordion, one open at a time).
   - Margin column: inline progress bar (`<Progress />` 48px wide, color via threshold class) + numeric percentage.
   - Status column: Phosphor icon + text (icons: `PencilSimple` Draft, `Eye` Review, `PaperPlaneTilt` Sent, `Trophy` Won, `XCircle` Lost, `Clock` Expired).
5. Expanded row detail panel (inline): two-column layout. Left: cost breakdown bar chart (recharts horizontal `BarChart` with `<Cell fill="var(--chart-N)" />` cycling) + operations routing mini-table. Right: `<AiCallout variant="subtle">` + similar jobs list.
6. Bottom of page: `<AiCallout variant="banner">` with `aiBannerHeadline`, `aiBannerBody`, optional action button.

**Quote Builder modal (3 steps, opens on "New Quote"):**

State machine: `step: 1 | 2 | 3`, `formFields`, `marginValue: number`.

- **Step 1 — RFQ form:** `<Dialog>` with form fields (Customer/Material/Part Description as `<Input>` + `<Label>`; Quantity as numeric `<Input>`; Urgency as `<ToggleGroup type="single">` with pill items Standard/Rush/AOG; Certifications as four `<Checkbox>` rows AS9100/ITAR/NADCAP/ISO 9001; drop zone for drawings — visual-only, no real upload). Footer: "Generate Quote" primary button → advances to Step 2.
- **Step 2 — AI processing:** `<AiProcessingSteps />` with four steps ("Analyzing material costs", "Checking similar jobs", "Computing operations routing", "Validating margin targets"). Tool transitions step statuses on `setTimeout` (1200ms each). Auto-advance to Step 3 ~5s after entry.
- **Step 3 — Quote review:** Two-column layout. Left: cost breakdown chart + operations routing table. Right: `<AiCallout variant="subtle">` with AI narrative + similar jobs list + `<Slider>` (10–45% margin, default 28%) that **live-recalculates** total / unit / margin $ on each change + price summary tile (`bg-primary text-primary-foreground rounded-xl p-4`). Footer: "← Back to Form" (ghost), "Save as Draft" (outline), "Send to Customer" (primary).

**Interactivity contract (per framework spec §9):**
- All state local via `useState` / `useReducer`.
- Initial state seeds from props on mount; internal state is source of truth thereafter.
- Filter tabs filter the displayed `quotes` array (no reload).
- Expanded row state: `expandedId: string | null`.
- Modal state: `{ open, step, formFields, marginValue }`.
- "Save as Draft" updates the row's status pill in place (mutates internal copy of quotes).
- "Send to Customer" same, status → Sent.
- "Apply Suggestion" on the AI banner: dismisses the banner (sets `bannerDismissed: true`).

### Acceptance criteria

- [ ] `components/ui/{card,badge,input,label,toggle-group,checkbox,dialog,slider,progress}.tsx` exist and follow the existing primitive authoring pattern (no `forwardRef`, `data-slot` on roots, named exports, `radix-ui` namespace imports).
- [ ] `components/tools/_shared.tsx` exports `KpiCard`, `KpiRow`, `AiChip`, `AiCallout`, `AiProcessingSteps`, `HelpTooltip`. No sparkle/wand iconography anywhere in the file.
- [ ] `components/tools/quoting-tool.tsx` default-exports `QuotingTool`, named-exports `QuotingToolProps` (and `QuoteRow`).
- [ ] File size: `quoting-tool.tsx` ≤ 600 lines including inline sub-components.
- [ ] `app/page.tsx` is updated to render a fully-mocked `<QuotingTool ... />` so the page is browseable in `npm run dev` for visual review.
- [ ] All buttons advance visible local state per §9.4 of the framework spec — no silent buttons.
- [ ] Step-2 modal animation completes in ~5s and auto-advances to Step 3.
- [ ] Margin slider in Step 3 live-updates total / unit / margin $.
- [ ] `npm run build` succeeds with no type errors.
- [ ] Manual smoke test: open `/`, click "New Quote", complete all 3 steps, click "Save as Draft" → row appears with Draft status. Refresh → state resets cleanly.
- [ ] No `lucide-react` imports anywhere; only `@phosphor-icons/react` with `weight="light"` (regular for chips, bold for indicators).
- [ ] No raw hex colors except the existing `#6b8f71` / `#b05a5a` delta triangle colors (mirrored in KpiCard).

### Dependencies & risks

**Dependencies:** None new — `radix-ui`, `recharts`, `@phosphor-icons/react`, `class-variance-authority`, `clsx`, `tailwind-merge` are all already in `package.json`.

**Risks:**
- *Modal close button required by Radix.* Every `Dialog` must render a `DialogTitle` or runtime warns. Mitigated by always rendering one (use `<VisuallyHidden>` from `radix-ui` if visual title not desired).
- *File size budget.* Quoting tool is the largest of the four — sub-components and mock-helper functions all live inline. If the file approaches 600 lines, extract pure presentational sub-components into the same file as named functions (per framework spec §5.3) before considering a split.
- *`@/components/tools/quoting-tool` collision with `templates/app/quoting/page.tsx`.* Templates are excluded by `tsconfig.json` so there's no compile-time conflict, but they remain as V0 reference noise. Cleanup of redundant templates is **out of scope for this plan** (per framework spec §11).
- *V0 prompt update is downstream.* This plan makes the tool importable; the `rosedale-os/lib/v0/prompts.ts` mapping from `tool_type` → tool import is a separate change in the other repo.

## Success metrics

- One demo can be generated end-to-end via the rosedale-os pipeline using this tool (manual validation, post-merge).
- Quoting tool renders, all interactive elements respond, no console warnings.

## References

- Framework spec: `docs/superpowers/specs/2026-05-08-tools-framework-design.md`
- UX reference: `C:\Users\matte_uea9zx9\website-demo\docs\ux-quoting-tool.md`
- Existing primitive authoring patterns to mirror:
  - `components/ui/button.tsx`
  - `components/ui/separator.tsx`
  - `components/ui/tooltip.tsx`
- Existing reference compositions:
  - `templates/app/quoting/page.tsx` (KPI tiles, filter tabs, status pill taxonomy, recharts BarChart conventions, table grid spacing)
  - `templates/components/dashboards/manufacturing-primitives.tsx:29-56` (canonical `StatCard`)
- Project memory:
  - `feedback_no_ai_cliches.md` — no ✨ / wand / magic-star iconography
  - `feedback_branch_workflow.md` — work on feature branches, not main
- Tooling:
  - `lib/utils.ts` — `cn()` helper
  - `tsconfig.json:25-29` — `@/*` resolves to repo root
