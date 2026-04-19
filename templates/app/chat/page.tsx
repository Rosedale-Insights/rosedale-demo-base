// TEMPLATE — reference only. V0 reads this to learn the Rosedale chat
// panel composition: brand wordmark at top, starter-question chips as the
// empty state, message bubbles with tool-call chips inline, sticky input
// at the bottom. Not routed by Next.js.
//
// This is the canonical shape when a demo's AI-showcase zone is
// "Knowledge-base chat with tools" — the operator asks an operational
// question, the agent answers after calling one or more data tools, and
// each tool call is visible as a small chip.
//
// Composition rules demonstrated:
//   - Outer container: h-full + flex-col + bg-card
//   - Header: small wordmark + one-line descriptor, border-bottom
//   - Scroll area: flex-1, overflow-y-auto, px-4 py-4, space-y-4
//   - Starter state (empty): centered block with brand avatar circle,
//     "Ask about X" caption, and 4 suggestion chips (rounded-2xl,
//     border, hover lift, left-aligned, 13px text)
//   - User bubble: bg-muted, rounded-2xl rounded-tr-md, text-sm,
//     max-w-[85%], self-end
//   - Assistant bubble: plain text (no bubble), starts with small
//     "Rosedale" label in 10px uppercase tracking-wider muted
//   - Tool call chip: inline-flex, bg-muted, border, rounded-md,
//     h-6, px-2, text-[11px], phosphor icon on the left + tool name
//     + optional "→ result count" suffix
//   - Input bar: sticky bottom, border-top, 14px textarea + square
//     "Send" icon button using the accent color (var(--primary))
//
// V0 can either wrap this in AppShell as a /chat tab, or lift the inner
// scroll+input block into a right-rail inside another page. The starter
// state should be replaced with a short seeded conversation when the
// demo's discovery context suggests frequent chat usage.

"use client";

import {
  ArrowUp,
  ChatCircle,
  Database,
  MagnifyingGlass,
  TrendUp,
} from "@phosphor-icons/react";
import { AppShell } from "@/app/components/layout/AppShell";

/* ---------- Primitives ---------------------------------------------------- */

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
      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-muted px-3 py-2 text-sm text-foreground">
        {text}
      </div>
    </div>
  );
}

interface AssistantTurnProps {
  text: string;
  toolCalls?: ToolChipProps[];
}

function AssistantTurn({ text, toolCalls }: AssistantTurnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Rosedale
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

/* ---------- Page ---------------------------------------------------------- */

// Seeded conversation — V0 swaps the Qs/As per demo based on discovery
// context. Keep turn count modest (2–3 exchanges) so the scroll is honest.
const SEEDED: Array<
  { kind: "user"; text: string } | { kind: "assistant"; text: string; toolCalls?: ToolChipProps[] }
> = [
  { kind: "user", text: "What's our on-time delivery rate this quarter, and how does it compare to Q1?" },
  {
    kind: "assistant",
    text:
      "Q2 is running at 94.3% on-time delivery — up 2.1 points from Q1's 92.2%. The improvement is concentrated on Midwest lanes; the Southwest corridor is still underperforming the company average by 1.4 points.",
    toolCalls: [
      { tool: "query_shipments", result: "8,412 rows", icon: Database },
      { tool: "compare_periods", result: "Q1 vs Q2", icon: TrendUp },
    ],
  },
  { kind: "user", text: "Which three suppliers contributed most to the delays?" },
  {
    kind: "assistant",
    text:
      "Titan Forge (47 late POs, 62% on-time), BrightPath Polymers (31 POs, 71%), and Keystone Cast (24 POs, 68%). All three cluster in April — I can schedule supplier reviews if that helps.",
    toolCalls: [
      { tool: "search_suppliers", result: "3 matches", icon: MagnifyingGlass },
    ],
  },
];

export default function ChatPageTemplate() {
  return (
    <AppShell>
      <div className="pt-2">
        <h1 className="text-2xl">Ask Rosedale</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conversational access to operational data. Agents query the warehouse, summarize findings, and answer follow-ups.
        </p>
      </div>

      <div className="mt-6 flex flex-col bg-card border border-border rounded-xl overflow-hidden h-[640px]">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 h-11 border-b border-border">
          <ChatCircle weight="regular" size={14} className="text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Conversation
          </span>
        </div>

        {/* Scroll area */}
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
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-white px-3 py-2 focus-within:border-[#1a1a1a]/30 transition-colors">
            <textarea
              rows={1}
              placeholder="Ask about suppliers, shipments, OEE, margins…"
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
      </div>
    </AppShell>
  );
}

/* ---------- Starter state (empty conversation) --------------------------- */

const STARTERS = [
  "What's our on-time delivery rate this quarter?",
  "Which suppliers are trending toward at-risk status?",
  "Summarize yesterday's production misses.",
  "Show me margin by product line, last 30 days.",
];

function StarterState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-[#1a1a1a]">
          <span className="text-lg font-bold tracking-tight text-white">R</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-[#1a1a1a]">
          Rosedale
        </h3>
        <p className="mt-1 text-sm text-[#1a1a1a]/50">
          Ask about suppliers, shipments, production & margins
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2">
        {STARTERS.map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-2xl border border-border bg-white px-3.5 py-2.5 text-left text-[13px] leading-snug text-[#1a1a1a]/80 transition-all hover:border-[#1a1a1a]/20 hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
