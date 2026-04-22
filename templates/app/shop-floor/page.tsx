// TEMPLATE — reference only. V0 reads this to learn the Rosedale shop-floor
// dashboard composition for manufacturing clients (4-up KPI row + a 2-column
// split with a dense machine-status table alongside a maintenance timeline).
// Not picked up by Next.js routing — lives under `templates/` as V0 context.
//
// Composition rules demonstrated:
//   - 4-up StatCard row using the same tile shape as templates/app/page.tsx
//   - Dense zebra-less table with 8 machine rows; colored status dot in col 1
//   - Maintenance timeline card with vertical rail + ring-2 ring-card dots
//   - Status chips reuse the bg-*-50 / text-*-700 convention from [tab]/page.tsx
//   - Chart-palette vars only for dot/chip colors (no raw hex in JSX)

import { AppShell } from "@/app/components/layout/AppShell";

/* ---------- Inlined primitives (kept self-contained so V0 mirrors easily) -- */

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

type MachineStatus = "Running" | "Idle" | "Setup" | "Maintenance" | "Down";

const statusDotClass: Record<MachineStatus, string> = {
  Running: "bg-chart-1",
  Idle: "bg-muted-foreground",
  Setup: "bg-chart-3",
  Maintenance: "bg-chart-4",
  Down: "bg-destructive",
};

const statusTextClass: Record<MachineStatus, string> = {
  Running: "text-emerald-700",
  Idle: "text-muted-foreground",
  Setup: "text-amber-700",
  Maintenance: "text-sky-700",
  Down: "text-rose-700",
};

/* ---------- Data (plausible aerospace CNC shop) --------------------------- */

interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  job: string | null;
  oee: number | null;
  parts: string | null;
  health: number;
}

const machines: Machine[] = [
  { id: "5AX-02", name: "Hermle C400", status: "Down", job: null, oee: null, parts: null, health: 34 },
  { id: "HT-01", name: "Lindberg Blue M", status: "Maintenance", job: "WO-4835", oee: null, parts: "6 / 6", health: 76 },
  { id: "CNC-03", name: "Haas VF-2", status: "Setup", job: null, oee: null, parts: null, health: 95 },
  { id: "CNC-01", name: "Mazak VTC-800/30", status: "Running", job: "WO-4821", oee: 87, parts: "142 / 160", health: 92 },
  { id: "CNC-02", name: "Haas VF-4SS", status: "Running", job: "WO-4842", oee: 79, parts: "98 / 140", health: 68 },
  { id: "5AX-01", name: "DMG Mori DMU 50", status: "Running", job: "WO-4835", oee: 91, parts: "4 / 6", health: 88 },
  { id: "LAT-01", name: "Okuma LB3000", status: "Running", job: "WO-4850", oee: 86, parts: "36 / 40", health: 90 },
  { id: "LAS-01", name: "Trumpf TruLaser 3030", status: "Running", job: "WO-4850", oee: 93, parts: "58 / 60", health: 97 },
];

type TimelineType = "Preventive" | "Predictive" | "Corrective";
type TimelineStatus = "Scheduled" | "In Progress" | "Complete" | "Overdue";

interface MaintenanceEvent {
  date: string;
  machine: string;
  description: string;
  type: TimelineType;
  status: TimelineStatus;
  aiConfidence?: number;
}

const maintenanceEvents: MaintenanceEvent[] = [
  { date: "Mar 16", machine: "Hermle C400", description: "Spindle motor replacement — bearing seizure detected", type: "Corrective", status: "In Progress" },
  { date: "Mar 20", machine: "Haas VF-4SS", description: "Spindle bearing inspection — vibration trending 2.3σ above baseline", type: "Predictive", status: "Scheduled", aiConfidence: 87 },
  { date: "Mar 20", machine: "Lindberg Blue M", description: "Heating element degradation — output variance increasing", type: "Predictive", status: "Scheduled", aiConfidence: 74 },
  { date: "Mar 22", machine: "Mazak VTC-800/30", description: "Scheduled spindle bearing inspection at 4,500 hours", type: "Preventive", status: "Scheduled" },
  { date: "Mar 15", machine: "Okuma LB3000", description: "Coolant system flush and concentration reset", type: "Preventive", status: "Complete" },
];

const typeDotClass: Record<TimelineType, string> = {
  Preventive: "bg-chart-4",
  Predictive: "bg-chart-3",
  Corrective: "bg-destructive",
};

const statusChipClass: Record<TimelineStatus, string> = {
  Scheduled: "bg-sky-50 text-sky-700",
  "In Progress": "bg-amber-50 text-amber-700",
  Complete: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-rose-50 text-rose-700",
};

/* ---------- Page --------------------------------------------------------- */

export default function TemplateShopFloorPage() {
  const running = machines.filter((m) => m.status === "Running").length;
  const offline = machines.filter((m) => m.status === "Down" || m.status === "Maintenance").length;

  return (
    <AppShell>
      <div className="pt-2">
        <h1 className="text-2xl">Shop Floor Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time machine status, OEE, and maintenance across aerospace CNC operations.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <KpiTile label="OEE" value="84.2%" delta={{ direction: "up", amount: "1.4 WoW" }} sub="Target 85%" />
        <KpiTile label="Utilization" value="78.4%" delta={{ direction: "up", amount: "2.1 WoW" }} />
        <KpiTile label="Active work orders" value="14" sub="2 at risk" />
        <KpiTile label="Shift coverage" value="92%" sub="Day + Swing staffed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="bg-card border border-border rounded-xl lg:col-span-2">
          <div className="px-5 py-4 border-b border-border">
            <div className="text-sm font-semibold">Machine fleet</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {running} running · {offline} offline · sorted by risk
            </div>
          </div>

          {/* Horizontal-scroll wrapper: 8-col machine table needs ~720px
              min width to stay readable; inside a lg:col-span-2 grid
              track, the table gets ~2/3 of the row but still shrinks
              below the md breakpoint. */}
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
          <div className="grid grid-cols-[16px_84px_1fr_80px_80px_60px_64px_56px] items-center gap-3 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40">
            <span />
            <span>ID</span>
            <span>Machine</span>
            <span>Status</span>
            <span>Job</span>
            <span>OEE</span>
            <span>Parts</span>
            <span className="text-right">Health</span>
          </div>

          {machines.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[16px_84px_1fr_80px_80px_60px_64px_56px] items-center gap-3 px-5 py-2.5 border-t border-border"
            >
              <span className={`mx-auto h-2 w-2 rounded-full ${statusDotClass[m.status]}`} />
              <span className="text-xs font-medium">{m.id}</span>
              <span className="text-xs text-muted-foreground truncate">{m.name}</span>
              <span className={`text-xs font-medium ${statusTextClass[m.status]}`}>{m.status}</span>
              <span className="text-xs text-muted-foreground">{m.job ?? "—"}</span>
              <span className="text-xs tabular-nums">{m.oee !== null ? `${m.oee}%` : "—"}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{m.parts ?? "—"}</span>
              <span className={`text-xs text-right tabular-nums font-medium ${m.health >= 80 ? "text-emerald-700" : m.health >= 60 ? "text-amber-700" : "text-rose-700"}`}>{m.health}</span>
            </div>
          ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold">Maintenance schedule</div>
          <div className="text-xs text-muted-foreground mt-0.5">Upcoming and recent events</div>

          <div className="relative mt-4 pl-4">
            <div className="absolute top-0 bottom-0 left-[7px] w-px bg-border" />
            <div className="space-y-4">
              {maintenanceEvents.map((e, i) => (
                <div key={i} className="relative flex gap-3">
                  <div className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-card ${typeDotClass[e.type]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{e.date}</span>
                      <span className="text-xs text-muted-foreground">—</span>
                      <span className="text-xs font-medium text-muted-foreground truncate">{e.machine}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${statusChipClass[e.status]}`}>{e.status}</span>
                      <span className="text-[11px] font-medium text-muted-foreground">{e.type}</span>
                      {e.aiConfidence !== undefined && <span className="text-[11px] font-medium text-muted-foreground">AI · {e.aiConfidence}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
