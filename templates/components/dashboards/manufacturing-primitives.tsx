// TEMPLATE — reference only. V0 reads this as the canonical shape of four
// small building blocks used across the manufacturing dashboard templates
// (shop-floor, delivery, quoting). Each target page inlines its own equivalents
// rather than importing from here — V0 learns better from self-contained page
// examples. Use this file as the source of truth when any inlined version drifts.
//
// Composition rules demonstrated:
//   - StatCard: label text-xs muted · value text-2xl tabular-nums · delta
//     with inline triangle SVG in muted green (#6b8f71) or rose (#b05a5a).
//   - Sparkline: single-stroke Recharts LineChart, 60×24, no axes, chart-1.
//   - TimelineItem: colored dot (chart-N var) + ring offset + title/description
//     + status chip using the Rosedale bg-*-50 / text-*-700 pattern.
//   - StatusDot: 8px rounded-full span, variants mapped to chart palette vars
//     and --destructive (never raw hex, never lucide).

"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

/* ---------- StatCard ------------------------------------------------------ */

interface StatCardProps {
  label: string;
  value: string;
  delta?: { direction: "up" | "down"; amount: string };
  sub?: string;
}

export function StatCard({ label, value, delta, sub }: StatCardProps) {
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
      {sub && (
        <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
      )}
    </div>
  );
}

/* ---------- Sparkline ----------------------------------------------------- */

interface SparklineProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = "var(--chart-1)" }: SparklineProps) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: 60, height: 24 }}>
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- TimelineItem -------------------------------------------------- */

type TimelineType = "preventive" | "predictive" | "corrective";

interface TimelineItemProps {
  type: TimelineType;
  date: string;
  title: string;
  description: string;
  status: "Scheduled" | "In Progress" | "Complete" | "Overdue";
  meta?: string;
}

const timelineDot: Record<TimelineType, string> = {
  preventive: "bg-chart-4",
  predictive: "bg-chart-3",
  corrective: "bg-destructive",
};

const timelineStatusChip: Record<TimelineItemProps["status"], string> = {
  Scheduled: "bg-sky-50 text-sky-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Complete: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-rose-50 text-rose-700",
};

export function TimelineItem({
  type,
  date,
  title,
  description,
  status,
  meta,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-3">
      <div
        className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-card ${timelineDot[type]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{date}</span>
          <span className="text-xs text-muted-foreground">—</span>
          <span className="text-xs font-medium text-muted-foreground truncate">
            {title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${timelineStatusChip[status]}`}
          >
            {status}
          </span>
          {meta && (
            <span className="text-[11px] text-muted-foreground">{meta}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- StatusDot ----------------------------------------------------- */

type StatusVariant = "running" | "idle" | "setup" | "maintenance" | "down";

const dotVariant: Record<StatusVariant, string> = {
  running: "bg-chart-1",
  idle: "bg-muted-foreground",
  setup: "bg-chart-3",
  maintenance: "bg-chart-4",
  down: "bg-destructive",
};

export function StatusDot({ variant }: { variant: StatusVariant }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${dotVariant[variant]}`} />
  );
}
