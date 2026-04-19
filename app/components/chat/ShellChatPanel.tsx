"use client";

import {
  ArrowUp,
  ChatCircle,
  Database,
  MagnifyingGlass,
  TrendUp,
} from "@phosphor-icons/react";

interface ShellChatPanelProps {
  brandName: string;
  // Optional — V0 can pass per-demo starter questions sourced from
  // discovery (pain points / workflows / metrics). Falls back to a
  // generic set below when omitted.
  starterQuestions?: string[];
}

// Inert chat panel for the right-rail slide-out in AppShell. No real
// streaming, no real tools — demos are public mocks. The composition
// matches the /templates/app/chat/ reference so V0-generated demos feel
// consistent whether chat is in the shell rail or as a dedicated tab.
export function ShellChatPanel({ brandName, starterQuestions }: ShellChatPanelProps) {
  const brand = brandName || "Rosedale";
  const questions =
    starterQuestions?.length
      ? starterQuestions
      : [
          "What's our on-time delivery rate this quarter?",
          "Which suppliers are trending toward at-risk?",
          "Summarize yesterday's misses.",
          "Show me margin by product line, last 30 days.",
        ];

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-11 border-b border-border shrink-0">
        <ChatCircle weight="regular" size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ask {brand}
        </span>
      </div>

      {/* Seeded example: one exchange above the starter chips so the panel
          feels alive rather than empty. V0 can replace with a fuller
          conversation when the AI-showcase zone is "knowledge-base chat". */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-muted px-3 py-2 text-sm text-foreground">
            What's our on-time delivery rate this quarter?
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {brand}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <ToolChip tool="query_shipments" result="8,412 rows" icon={Database} />
            <ToolChip tool="compare_periods" result="Q1 vs Q2" icon={TrendUp} />
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            Q2 is running at 94.3% — up 2.1 points from Q1&apos;s 92.2%. The improvement
            is concentrated on Midwest lanes; Southwest is still 1.4 points below
            the company average.
          </p>
        </div>

        <div className="pt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Try asking
          </div>
          <div className="flex flex-col gap-2">
            {questions.map((q) => (
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
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-3 shrink-0">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-white px-3 py-2">
          <textarea
            rows={1}
            placeholder={`Ask ${brand} anything…`}
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
  );
}

function ToolChip({
  tool,
  result,
  icon: Icon,
}: {
  tool: string;
  result?: string;
  icon: React.ComponentType<{ weight?: "regular"; size?: number }>;
}) {
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

// Keep unused import warning quiet; MagnifyingGlass is exported for V0 to
// pick up as a tool-chip icon option without adding to the package surface.
void MagnifyingGlass;
