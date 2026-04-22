// TEMPLATE — reference only. V0 reads this to learn the Rosedale KPI-row +
// chart-card composition, then creates a client-specific `app/page.tsx`.
// This file lives under `templates/` so it isn't picked up by Next.js routing.
//
// Composition rules demonstrated here:
//   - Page-level h1 at text-2xl (700 weight via globals.css heading rule)
//   - Three KPI tiles in a 3-tier responsive grid: 1 col on phones
//     (< 640), 2 cols on small screens (640-1023), 3 cols at lg+. NEVER
//     skip the sm: tier — a 1→3 jump leaves a dead band between 640 and
//     1023 where tiles look visually orphaned.
//   - One Recharts bar chart card with muted Rosedale palette (chart-1..5)
//   - Tight vertical rhythm — gap-4 between rows, pt-2 top padding
//   - `<AppShell logoUrl={...} brandName={...}>` — V0 passes the
//     prospect's favicon URL (resolved on the Rosedale side) and their
//     company name. The shell renders the favicon to the left of the
//     wordmark automatically. Do not render the logo anywhere else.

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/app/components/layout/AppShell";

interface KpiTileProps {
  label: string;
  value: string;
  delta?: string;
}

function KpiTile({ label, value, delta }: KpiTileProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl">{value}</div>
        {delta && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

// Plausible, hand-authored values — never Lorem or "Acme Corp" strings.
// V0 replaces these with industry-relevant metrics per the input brief.
const weeklyData = [
  { week: "W-6", done: 24, inProgress: 12 },
  { week: "W-5", done: 19, inProgress: 15 },
  { week: "W-4", done: 27, inProgress: 11 },
  { week: "W-3", done: 22, inProgress: 14 },
  { week: "W-2", done: 31, inProgress: 9 },
  { week: "W-1", done: 28, inProgress: 13 },
];

export default function TemplateHomePage() {
  return (
    <AppShell
      brandName="Acme"
      logoUrl="https://example.com/favicon.png"
    >
      <div className="pt-2">
        <h1 className="text-2xl">Home</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of the week's activity and key performance indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <KpiTile label="Issues completed" value="28" delta="+12% WoW" />
        <KpiTile label="In progress" value="13" delta="3 stalled" />
        <KpiTile label="Active members" value="8" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mt-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold">Weekly throughput</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Issues done vs. in progress, last six weeks.
            </div>
          </div>
        </div>
        <div className="mt-4" style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <RechartsTooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="done" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
