# rosedale-demo-base

Canonical Rosedale OS template repo. Every Demo Creator run in `rosedale-os` initializes from this branch via `v0.chats.init({ type: 'repo', repo: { url, branch } })` — V0 reads the files here as real code context and generates client-specific pages on top.

> **Do not edit this repo directly.** Changes flow through the sync mechanism in `rosedale-os` (Phase 2 of the plan). Direct edits will be overwritten on the next sync.

## What's here

| Path | Purpose | V0 should... |
|------|---------|-------------|
| `app/globals.css` | Full Rosedale OS token set (Manrope, radii, surface colors, chart palette). | **Preserve.** Tenant theming flows through CSS var overrides, not edits here. |
| `app/layout.tsx` | Root layout with Manrope font + TooltipProvider. | **Preserve.** |
| `app/page.tsx` | Trivial placeholder so `npm run build` passes. | **Replace** per demo with a client-specific KPI dashboard, following `templates/app/page.tsx`. |
| `app/components/layout/*` | AppShell, TopBar, Sidebar, NavItem, nav-config. The 220px-sidebar shell. | **Preserve.** Use as-is; pass `brandName` prop to `AppShell`. |
| `components/ui/*` | shadcn primitives (button, tooltip, separator). | **Preserve and import.** Add more primitives via the shadcn CLI as needed — do not reimplement. |
| `lib/utils.ts` | `cn()` helper combining `clsx` + `tailwind-merge`. | **Preserve.** |
| `templates/app/page.tsx` | Reference home page — KPI row + Recharts bar chart card. | **Mirror composition.** Not picked up by Next.js routing; lives here as code V0 learns from. |
| `templates/app/[tab]/page.tsx` | Reference tab page — header + card list with status chips. | **Mirror composition** when creating files under `app/[tab]/page.tsx` per the client's tab list. |

## Behavior rules (MUST hold across every generated demo)

- All data is plausible, industry-appropriate placeholder content. **No Lorem Ipsum. No "Acme Corp."**
- Buttons and links can look interactive but **do nothing** when clicked.
- **No** login screens, **no** real API calls, **no** Supabase / auth wiring, **no** environment variables.
- Use **recharts** for all charts. Use the `--chart-1` through `--chart-5` CSS vars for colors — do not pick arbitrary hex.
- Include a Settings footer item in the sidebar (gear icon) for Rosedale OS parity.
- Typography: **Manrope only.** Body 13px/400, headings use the `text-xl`/`text-2xl` classes which pick up 700 weight + `-0.015em` tracking from `globals.css`.
- Buttons: use the shadcn `<Button>` primitive from `components/ui/button.tsx`.

## Shell anatomy (for V0 reference)

- **TopBar**: 48px tall, `bg-[#1a1a1a]`, wordmark left, blank right (no user menu — demos are public).
- **Sidebar**: 220px fixed width on desktop, `bg-surface-sidebar`, `pt-4`. Collapses to a drawer on mobile (<768px).
- **Main**: `bg-surface-main`, `rounded-xl` on the sidebar-adjacent corners, `max-w-[96rem]` inner container, `px-8 pt-5 pb-6`.
- **Outer frame**: `bg-[#1a1a1a]` around the rounded main panel — gives the editorial "panel-in-a-frame" feel.

## Per-tenant theming

V0 generations layer a client's brand on top of this base via CSS var overrides in a separate `app/brand.css` (not committed here — V0 creates it per demo). Example:

```css
/* app/brand.css, generated per demo */
:root {
  --primary: oklch(0.5 0.12 240);   /* client accent */
}
```

`app/layout.tsx` imports `brand.css` after `globals.css` so the overrides win cascade order.

## Running locally (rare)

The base repo is not a deliverable app — its job is to serve as seed context for V0. But you can `npm install && npm run dev` to verify the shell renders in isolation before tagging a new version.

```bash
npm install
npm run dev
# → http://localhost:3000 shows the placeholder home page.
```

## Versioning

Tags follow `v0.N.0`. Increment on any of: added/removed shell file, token change, layout change, nav-config change. In-flight demos pin to the tag they were created against (see `demos.template_commit_sha` in `rosedale-os`) and do not auto-upgrade.

## Upstream

Source of truth: [Rosedale-Insights/rosedale-os](https://github.com/Rosedale-Insights/rosedale-os). See [`docs/plans/2026-04-17-002-feat-rosedale-demo-base-template-plan.md`](https://github.com/Rosedale-Insights/rosedale-os/blob/main/docs/plans/2026-04-17-002-feat-rosedale-demo-base-template-plan.md) for the design decision and rollout plan, and the [Phase 0 spike report](https://github.com/Rosedale-Insights/rosedale-os/blob/main/docs/solutions/integration-issues/v0-chats-init-repo-2026-04-17.md) for the V0 integration validation that green-lit this repo.
