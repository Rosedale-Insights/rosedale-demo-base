// TEMPLATE — reference only. V0 reads this to learn the Rosedale
// side-panel chat composition: a right-rail chat that lives next to the
// page's main content, NOT a full-page takeover. Not routed by Next.js —
// templates/ is excluded from compilation.
//
// This is the canonical shape when a demo's AI-showcase zone is
// "Knowledge-base chat with tools." Two-column grid (main + chat-rail),
// both on the same surface, chat anchored right. V0 mirrors this on
// tabs where operators would plausibly ask operational questions while
// reviewing KPIs (Home, Shipments, Suppliers, etc.).
//
// Composition rules demonstrated:
//   - Parent grid: `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]`.
//     Single column below lg (< 1024 px) so the rail stacks below main.
//     Side-by-side at lg+. NEVER use an inline `style={{
//     gridTemplateColumns: ... }}` — Tailwind variants cannot override it
//     and mobile collapses silently.
//   - Rail surface: bg-card + border + rounded-xl. Sticky top only at
//     lg+ (`lg:sticky lg:top-2`) so it doesn't stick while stacked below
//     main on narrow viewports. Height is a short fixed value on mobile
//     (`h-[480px]`) and a full-viewport calc at lg+.
//   - Panel header: small icon + "ASK <BRAND>" label, border-bottom.
//   - Scroll body: flex-1 overflow-y-auto px-4 py-4 space-y-4.
//   - Starter state: brand avatar + "Ask about X" + 3–4 suggestion
//     chips. The starter questions are generated per demo from the
//     enrichment's pain_points / workflows / metrics_they_care_about —
//     V0 should write concrete operational questions the prospect would
//     actually ask, in their own vocabulary.
//   - User bubble: bg-muted, rounded-2xl rounded-tr-md, self-end.
//   - Assistant turn: "ROSEDALE" or "<BRAND>" label in 10px uppercase
//     tracking-wider muted, then tool-call chip row, then answer text.
//   - Tool chip: inline-flex bg-muted border rounded-md h-6 px-2,
//     phosphor icon + tool name + "→ result" suffix. Keep chips
//     relevant to what the prospect actually cares about.
//   - Input: sticky bottom, rounded-2xl border, textarea + circular
//     send button using var(--primary).
//
// DYNAMIC FIELDS V0 must substitute per demo:
//   - BRAND (below): the client's company name or short form.
//     Replaces "Rosedale" in both the "Ask Rosedale" heading and the
//     starter state's brand circle/label.
//   - STARTER_QUESTIONS: 3–4 questions generated from the discovery
//     enrichment. NOT the generic suppliers/shipments examples below.
//     Good examples for a CNC manufacturer: "Which machines are
//     trending toward maintenance?" "What was yesterday's OEE by
//     line?" "Show me the top 3 supplier delay contributors."
//   - SEEDED conversation: optional. Leave empty (→ starter state) or
//     seed 1–2 exchanges that demonstrate tool-calling against the
//     prospect's actual data domain.

"use client";

import {
  ArrowUp,
  ChatCircle,
  Database,
  MagnifyingGlass,
  TrendUp,
} from "@phosphor-icons/react";
import { AppShell } from "@/app/components/layout/AppShell";

/* ---------- Dynamic fields (V0 rewrites per demo) ----------------------- */

// V0 — replace with the client's company name. Single token so it's easy
// to swap throughout the file.
const BRAND = "Rosedale";

// V0 — generate 3–4 questions from the discovery context (pain points,
// workflows mentioned, metrics_they_care_about). They should read like
// something the prospect would plausibly ask on a Monday morning.
const STARTER_QUESTIONS = [
  "What's our on-time delivery rate this quarter?",
  "Which suppliers are trending toward at-risk status?",
  "Summarize yesterday's production misses.",
  "Show me margin by product line, last 30 days.",
];

// V0 — optional seeded exchange. Set to [] to render the starter state.
const SEEDED: Array<
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string; toolCalls?: ToolChipProps[] }
> = [
  { kind: "user", text: "What's our on-time delivery rate this quarter, and how does it compare to Q1?" },
  {
    kind: "assistant",
    text:
      "Q2 is running at 94.3% on-time delivery — up 2.1 points from Q1's 92.2%. The improvement is concentrated on Midwest lanes; the Southwest corridor still underperforms the company average by 1.4 points.",
    toolCalls: [
      { tool: "query_shipments", result: "8,412 rows", icon: Database },
      { tool: "compare_periods", result: "Q1 vs Q2", icon: TrendUp },
    ],
  },
  { kind: "user", text: "Which three suppliers contributed most to the delays?" },
  {
    kind: "assistant",
    text:
      "Titan Forge (47 late POs, 62% on-time), BrightPath Polymers (31 POs, 71%), and Keystone Cast (24 POs, 68%). The delays cluster in April — schedule supplier reviews if that helps.",
    toolCalls: [
      { tool: "search_suppliers", result: "3 matches", icon: MagnifyingGlass },
    ],
  },
];

/* ---------- Panel primitives ------------------------------------------- */

interface ToolChipProps {
  tool: string;
  result?: string;
  icon?: React.ComponentType<{ weight?: "regular"; size?: number }>;
}

function ToolChip({ tool, result, icon: Icon = Database }: ToolChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-muted text-[11px] font-medium text-muted-foreground">
      <Icon weight="regular" size={12} />
      <span className="tabular-nums">{tool}</span>
      {result && (
        <>
          <span className="text-muted-foreground/60">→</span>
          <span className="text-foreground">{result}</span>
        </>
      )}
    </span>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-muted px-3 py-2 text-sm text-foreground">
        {text}
      </div>
    </div>
  );
}

function AssistantTurn({
  text,
  toolCalls,
}: {
  text: string;
  toolCalls?: ToolChipProps[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {BRAND}
      </div>
      {toolCalls && toolCalls.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {toolCalls.map((c, i) => (
            <ToolChip key={i} {...c} />
          ))}
        </div>
      )}
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

/* ---------- The side panel itself -------------------------------------- */

function ChatSidePanel() {
  return (
    <aside
      className="flex flex-col bg-card border border-border rounded-xl overflow-hidden h-[480px] lg:sticky lg:top-2 lg:h-[calc(100vh-120px)] lg:min-h-[520px]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-border shrink-0">
        <ChatCircle weight="regular" size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ask {BRAND}
        </span>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {SEEDED.length === 0 ? (
          <StarterState />
        ) : (
          SEEDED.map((t, i) =>
            t.kind === "user" ? (
              <UserBubble key={i} text={t.text} />
            ) : (
              <AssistantTurn key={i} text={t.text} toolCalls={t.toolCalls} />
            ),
          )
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-3 shrink-0">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 focus-within:border-[#1a1a1a]/30 transition-colors">
          <textarea
            rows={1}
            placeholder={`Ask ${BRAND} anything…`}
            className="w-full resize-none bg-transparent text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label="Send message"
            className="inline-flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground disabled:opacity-30"
            disabled
          >
            <ArrowUp weight="bold" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function StarterState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-6">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-[#1a1a1a]">
          <span className="text-base font-bold tracking-tight text-white">
            {BRAND.charAt(0)}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[#1a1a1a]">
          {BRAND}
        </h3>
        <p className="mt-1 text-xs text-[#1a1a1a]/50">
          Ask about your operations in plain English
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-2xl border border-border bg-white px-3 py-2 text-left text-[12px] leading-snug text-[#1a1a1a]/80 transition-all hover:border-[#1a1a1a]/20 hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page composition showing the side-panel integration -------- */

// This is the LAYOUT V0 should mirror when the AI-showcase zone is a
// knowledge-base chat. Main content fills the left; ChatSidePanel
// anchors the right rail at lg+ (>= 1024 px). Below lg the rail stacks
// below main content as a second row — natural single-column flow with
// a 480px chat height so the rail still looks like a chat, not a
// squished hint.

export default function ChatPageTemplate() {
  return (
    <AppShell brandName={BRAND}>
      <div className="grid gap-4 pt-2 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* LEFT — main content (per-demo, this is the actual page body:
            KPI row, charts, tables, etc.) */}
        <div className="min-w-0 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl">Good morning, team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what needs your attention today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["On-time delivery", "Suppliers at risk", "Throughput"].map((label) => (
              <div
                key={label}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-2xl mt-1 tabular-nums">—</div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm font-semibold">Recent activity</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              A placeholder block that V0 replaces with real per-demo content.
            </div>
          </div>
        </div>

        {/* RIGHT — side-panel chat rail */}
        <ChatSidePanel />
      </div>
    </AppShell>
  );
}
