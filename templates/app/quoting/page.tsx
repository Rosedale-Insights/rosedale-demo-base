// TEMPLATE — reference only. V0 reads this to learn the Rosedale quoting
// dashboard composition (3-up KPI row + visual filter tabs + quote table with
// margin bars + horizontal cost-breakdown bar chart).
// Not picked up by Next.js routing — lives under `templates/` as V0 context.
//
// Composition rules demonstrated:
//   - Filter tabs built from shadcn <Button>; active = variant="outline",
//     inactive = variant="ghost". Buttons do not filter (seed-only behavior).
//   - Quote table with inline margin bar: 48px track in bg-muted with a
//     rounded fill colored by threshold (emerald/amber/rose TW families).
//   - Status chip colors reuse the Rosedale bg-*-50 / text-*-700 pattern.
//   - Horizontal Recharts BarChart with layout="vertical", barSize 16, a
//     $/K tick formatter, and Cell fills cycled through var(--chart-1..5).

"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/app/components/layout/AppShell";
import { Button } from "@/components/ui/button";

/* ---------- Inlined KPI tile (self-contained so V0 mirrors easily) -------- */

interface KpiTileProps {
  label: string;
  value: string;
  delta?: { direction: "up" | "down"; amount: string };
  sub?: string;
}

function KpiTile({ label, value, delta, sub }: KpiTileProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl tabular-nums">{value}</div>
        {delta && (
          <span
            className="text-[11px] font-medium inline-flex items-center gap-0.5"
            style={{ color: delta.direction === "up" ? "#6b8f71" : "#b05a5a" }}
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor" aria-hidden>
              {delta.direction === "up" ? (
                <polygon points="4,0 8,6 0,6" />
              ) : (
                <polygon points="4,6 8,0 0,0" />
              )}
            </svg>
            {delta.amount}
          </span>
        )}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

/* ---------- Data (plausible CNC job-shop quotes) ------------------------- */

type QuoteStatus = "Draft" | "Review" | "Sent" | "Won" | "Lost";

interface QuoteRow {
  client: string;
  quoteId: string;
  project: string;
  amount: number;
  margin: number;
  confidence: number;
  status: QuoteStatus;
}

const quotes: QuoteRow[] = [
  { client: "Aerospace Dynamics", quoteId: "QT-2026-0891", project: "Titanium turbine housing", amount: 14528, margin: 28.4, confidence: 84, status: "Draft" },
  { client: "Precision Medical", quoteId: "QT-2026-0887", project: "Surgical-grade implant pins", amount: 8400, margin: 22.1, confidence: 91, status: "Review" },
  { client: "Global Robotics", quoteId: "QT-2026-0882", project: "Custom actuator assembly", amount: 31000, margin: 31.5, confidence: 78, status: "Sent" },
  { client: "Northvane Aero", quoteId: "QT-2026-0876", project: "Titanium bracket assembly", amount: 42800, margin: 26.8, confidence: 88, status: "Won" },
  { client: "Trident Metalworks", quoteId: "QT-2026-0871", project: "Turbine blade root fittings", amount: 67200, margin: 34.2, confidence: 92, status: "Won" },
  { client: "Automotive Core", quoteId: "QT-2026-0865", project: "Engine block prototype", amount: 8900, margin: 18.4, confidence: 65, status: "Lost" },
];

const statusChip: Record<QuoteStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Review: "bg-sky-50 text-sky-700",
  Sent: "bg-amber-50 text-amber-700",
  Won: "bg-emerald-50 text-emerald-700",
  Lost: "bg-rose-50 text-rose-700",
};

const marginBarClass = (m: number) =>
  m >= 25 ? "bg-emerald-500" : m >= 15 ? "bg-amber-500" : "bg-rose-500";

const costBreakdown = [
  { name: "Material", value: 2220 },
  { name: "Machine time", value: 4290 },
  { name: "Labor", value: 1140 },
  { name: "Setup", value: 680 },
  { name: "Tooling", value: 390 },
  { name: "Outside svc", value: 540 },
  { name: "Overhead", value: 2106 },
  { name: "Margin", value: 3162 },
];

const costBarFills = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--chart-1)",
  "var(--chart-2)", "var(--chart-3)",
];

const filterTabs: Array<QuoteStatus | "All"> = ["All", "Draft", "Review", "Sent", "Won", "Lost"];

/* ---------- Page --------------------------------------------------------- */

export default function TemplateQuotingPage() {
  const activeTab: (typeof filterTabs)[number] = "All";

  return (
    <AppShell>
      <div className="pt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">Quoting Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Open quotes, margin positioning, and estimate cost breakdown for the current sample job.
          </p>
        </div>
        <Button size="sm">New quote</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <KpiTile label="Win rate" value="64.2%" delta={{ direction: "up", amount: "3.1 MoM" }} sub="Trailing 90 days" />
        <KpiTile label="Avg turnaround" value="2.4h" delta={{ direction: "down", amount: "0.6h faster" }} />
        <KpiTile label="Pipeline value" value="$1.8M" sub="12 open quotes" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-4">
        {filterTabs.map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={tab === activeTab ? "outline" : "ghost"}
            className="text-xs"
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl mt-3">
        <div className="grid grid-cols-[1.6fr_2fr_1fr_1.2fr_80px_88px] items-center gap-4 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40">
          <span>Client &amp; ID</span>
          <span>Project</span>
          <span className="text-right">Amount</span>
          <span>Margin</span>
          <span className="text-right">Conf.</span>
          <span>Status</span>
        </div>
        {quotes.map((q) => (
          <div
            key={q.quoteId}
            className="grid grid-cols-[1.6fr_2fr_1fr_1.2fr_80px_88px] items-center gap-4 px-5 py-3 border-t border-border"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{q.client}</div>
              <div className="text-[11px] text-muted-foreground">{q.quoteId}</div>
            </div>
            <div className="text-sm text-muted-foreground truncate">{q.project}</div>
            <div className="text-sm text-right tabular-nums font-medium">
              ${q.amount.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-12 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${marginBarClass(q.margin)}`}
                  style={{ width: `${Math.min((q.margin / 40) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{q.margin}%</span>
            </div>
            <div className="text-xs text-right tabular-nums text-muted-foreground">{q.confidence}%</div>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md w-fit ${statusChip[q.status]}`}>
              {q.status}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mt-4">
        <div className="text-sm font-semibold">Cost breakdown — Aerospace Dynamics, QT-2026-0891</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Per-unit estimate · Ti-6Al-4V turbine housing · 6 pcs
        </div>
        <div className="mt-4" style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={costBreakdown} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={96} />
              <RechartsTooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {costBreakdown.map((entry, i) => (
                  <Cell key={entry.name} fill={costBarFills[i % costBarFills.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
