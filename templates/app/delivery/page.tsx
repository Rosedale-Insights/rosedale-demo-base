// TEMPLATE — reference only. V0 reads this to learn the Rosedale supply-chain
// dashboard composition (4-up KPI row + chart/donut split + at-risk PO table).
// Not picked up by Next.js routing — lives under `templates/` as V0 context.
//
// Composition rules demonstrated:
//   - Recharts AreaChart with var(--chart-1) fill gradient + dashed
//     ReferenceLine at 95% target, using var(--border) grid + var(--card) tooltip
//   - Recharts PieChart donut (innerRadius 55 / outerRadius 88) with 5 slices
//     each using a distinct var(--chart-N) via Cell
//   - Inline legend pairing color dot + label + percent, right-aligned
//   - Table header row at text-[11px] uppercase tracking-wider
//   - Risk chips reuse the bg-*-50 / text-*-700 pattern from [tab]/page.tsx

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/app/components/layout/AppShell";

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

/* ---------- Data --------------------------------------------------------- */

const otdTrend = [
  { week: "W1", otd: 92 }, { week: "W2", otd: 90 }, { week: "W3", otd: 93 },
  { week: "W4", otd: 89 }, { week: "W5", otd: 86 }, { week: "W6", otd: 84 },
  { week: "W7", otd: 87 }, { week: "W8", otd: 85 }, { week: "W9", otd: 88 },
  { week: "W10", otd: 86 }, { week: "W11", otd: 89 }, { week: "W12", otd: 87 },
];

const delayCauses = [
  { name: "Supplier production", value: 34, color: "var(--chart-1)" },
  { name: "Shipping / logistics", value: 24, color: "var(--chart-2)" },
  { name: "Material unavailability", value: 19, color: "var(--chart-3)" },
  { name: "Quality rejection", value: 13, color: "var(--chart-4)" },
  { name: "Customs / documentation", value: 10, color: "var(--chart-5)" },
];

type Risk = "Critical" | "At risk" | "Watch" | "On track";

const riskChip: Record<Risk, string> = {
  Critical: "bg-rose-50 text-rose-700",
  "At risk": "bg-amber-50 text-amber-700",
  Watch: "bg-sky-50 text-sky-700",
  "On track": "bg-emerald-50 text-emerald-700",
};

interface AtRiskOrder {
  po: string;
  supplier: string;
  material: string;
  promised: string;
  predicted: string;
  risk: Risk;
  confidence: number;
}

const atRiskOrders: AtRiskOrder[] = [
  { po: "PO-7198", supplier: "Pacific Fasteners",     material: "AN Bolts & hardware kit",  promised: "Mar 8",  predicted: "Mar 22", risk: "Critical", confidence: 72 },
  { po: "PO-7256", supplier: "Summit Alloys",         material: "Ti-6Al-4V bar stock",      promised: "Mar 18", predicted: "Mar 24", risk: "Critical", confidence: 65 },
  { po: "PO-7234", supplier: "Ironridge Metals",      material: "316 SS bar stock",         promised: "Mar 15", predicted: "Mar 18", risk: "At risk",  confidence: 87 },
  { po: "PO-7282", supplier: "Summit Alloys",         material: "Inconel 718 bar",          promised: "Mar 20", predicted: "Mar 23", risk: "At risk",  confidence: 74 },
  { po: "PO-7270", supplier: "Cascade Coatings",      material: "Type III anodize service", promised: "Mar 17", predicted: "Mar 19", risk: "Watch",    confidence: 81 },
  { po: "PO-7245", supplier: "Midwest Steel Supply",  material: "4140 steel plate",         promised: "Mar 14", predicted: "Mar 14", risk: "On track", confidence: 96 },
];

/* ---------- Page --------------------------------------------------------- */

export default function TemplateDeliveryPage() {
  const totalCauses = delayCauses.reduce((s, c) => s + c.value, 0);

  return (
    <AppShell>
      <div className="pt-2">
        <h1 className="text-2xl">Delivery Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Supplier performance, at-risk purchase orders, and delay root causes.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <KpiTile label="On-time delivery" value="87.3%" delta={{ direction: "down", amount: "1.2 WoW" }} sub="Target 95%" />
        <KpiTile label="At-risk orders" value="7" delta={{ direction: "up", amount: "2 this week" }} />
        <KpiTile label="Lead-time variance" value="+2.4d" sub="vs. promised" />
        <KpiTile label="Revenue at risk" value="$482K" sub="Across 4 work orders" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <div className="text-sm font-semibold">Supplier on-time delivery</div>
          <div className="text-xs text-muted-foreground mt-0.5">12-week trend vs. 95% target</div>
          <div className="mt-4" style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={otdTrend} margin={{ top: 8, right: 24, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="otdFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[75, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${v}%`} />
                <RechartsTooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [`${value}%`, "OTD"]}
                />
                <ReferenceLine y={95} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: "95% target", position: "right", fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Area type="monotone" dataKey="otd" stroke="var(--chart-1)" strokeWidth={2} fill="url(#otdFill)" dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }} activeDot={{ r: 5, fill: "var(--chart-1)", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold">Delay root causes</div>
          <div className="text-xs text-muted-foreground mt-0.5">Share of at-risk POs by category</div>
          <div className="mt-4" style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={delayCauses} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} dataKey="value" stroke="none">
                  {delayCauses.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {delayCauses.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-medium tabular-nums">{Math.round((c.value / totalCauses) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl mt-4">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-sm font-semibold">At-risk purchase orders</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {atRiskOrders.filter((o) => o.risk !== "On track").length} active POs requiring attention
          </div>
        </div>
        {/* Horizontal-scroll wrapper: multi-column grid tables need min-w
            below the md breakpoint, otherwise fr-columns squeeze to
            unreadable widths on phones. Inner container's min-w equals
            the sum of fixed cols + reasonable minimums for fr cols. */}
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
        <div className="grid grid-cols-[88px_1.2fr_1.6fr_80px_80px_1fr_60px] items-center gap-4 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40">
          <span>PO #</span>
          <span>Supplier</span>
          <span>Material</span>
          <span>Promised</span>
          <span>Predicted</span>
          <span>Risk</span>
          <span className="text-right">Conf.</span>
        </div>
        {atRiskOrders.map((o) => (
          <div key={o.po} className="grid grid-cols-[88px_1.2fr_1.6fr_80px_80px_1fr_60px] items-center gap-4 px-5 py-3 border-t border-border">
            <span className="text-xs font-medium">{o.po}</span>
            <span className="text-xs text-muted-foreground truncate">{o.supplier}</span>
            <span className="text-xs text-muted-foreground truncate">{o.material}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{o.promised}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{o.predicted}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md w-fit ${riskChip[o.risk]}`}>{o.risk}</span>
            <span className="text-xs text-right tabular-nums text-muted-foreground">{o.confidence}%</span>
          </div>
        ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
