"use client"

import * as React from "react"
import { Plus } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  HelpTooltip,
  KpiCard,
  KpiRow,
  type KpiCardProps,
} from "./_shared"
import SchedulePmModal, {
  type ScheduledPmEvent,
} from "./schedule-pm-modal"

/* ---------- Types -------------------------------------------------------- */

export type PmPriority = "Critical" | "High" | "Medium" | "Low"
export type PmStatus = "Overdue" | "In Progress" | "Scheduled" | "Completed"
export type VibrationStatus = "Normal" | "Attention" | "Alarm"

export interface KpiSpec extends KpiCardProps {}

export interface MachineCard {
  id: string
  name: string
  type: string
  spindleHours: number
  spindleHoursThreshold: number
  healthScore: number
  vibration: VibrationStatus
  nextPmDate: string
  openWorkOrders: number
  hoursQueued: number
}

export interface PmRow {
  machineId: string
  description: string
  windowStart: string
  windowEnd: string
  durationHrs: number
  priority: PmPriority
  conflictsCount: number
  status: PmStatus
}

export interface MaintenanceIntelligenceProps {
  title: string
  subtitle: string
  kpis: [KpiSpec, KpiSpec, KpiSpec, KpiSpec]
  machines: MachineCard[]
  pmSchedule: PmRow[]
}

/* ---------- Constants ---------------------------------------------------- */

const STATUS_ORDER: Record<PmStatus, number> = {
  Overdue: 0,
  "In Progress": 1,
  Scheduled: 2,
  Completed: 3,
}

const PRIORITY_CLASS: Record<PmPriority, string> = {
  Critical: "text-destructive font-semibold",
  High: "text-primary font-semibold",
  Medium: "text-foreground",
  Low: "text-muted-foreground",
}

const STATUS_VARIANT: Record<
  PmStatus,
  "default" | "secondary" | "destructive" | "outline" | "muted"
> = {
  Overdue: "destructive",
  "In Progress": "default",
  Scheduled: "outline",
  Completed: "muted",
}

const VIBRATION_CLASS: Record<VibrationStatus, string> = {
  Normal: "text-emerald-700",
  Attention: "text-amber-600",
  Alarm: "text-destructive",
}

/* ---------- Helpers ------------------------------------------------------ */

const fmtDate = (iso: string) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

const fmtRange = (start: string, end: string) =>
  start === end ? fmtDate(start) : `${fmtDate(start)} – ${fmtDate(end)}`

const byUrgency = (a: PmRow, b: PmRow) =>
  STATUS_ORDER[a.status] - STATUS_ORDER[b.status]

const spindleFillClass = (ratio: number) =>
  ratio >= 0.9
    ? "bg-rose-500"
    : ratio >= 0.7
      ? "bg-amber-500"
      : "bg-emerald-500"

const PRIORITY_FROM_CONFLICTS = (count: number): PmPriority =>
  count >= 3 ? "Critical" : count >= 1 ? "High" : "Medium"

const HRS_PER_DURATION_LABEL: Record<string, number> = {
  "4 hrs": 4,
  "8 hrs": 8,
  "1 day": 8,
  "2 days": 16,
}

/* ---------- Tool --------------------------------------------------------- */

export default function MaintenanceIntelligence(
  props: MaintenanceIntelligenceProps
) {
  const { title, subtitle, kpis, machines, pmSchedule } = props

  const [pmModalOpen, setPmModalOpen] = React.useState(false)
  const [appendedPms, setAppendedPms] = React.useState<PmRow[]>([])

  const allPms = React.useMemo(
    () => [...pmSchedule, ...appendedPms].slice().sort(byUrgency),
    [pmSchedule, appendedPms]
  )

  const handleConfirmPm = (event: ScheduledPmEvent) => {
    const newRow: PmRow = {
      machineId: event.machineId,
      description: `${event.pmType} — ${event.serviceProvider}`,
      windowStart: event.windowStart,
      windowEnd: event.windowEnd,
      durationHrs: HRS_PER_DURATION_LABEL[event.durationLabel] ?? 8,
      priority: PRIORITY_FROM_CONFLICTS(0),
      conflictsCount: 0,
      status: "Scheduled",
    }
    setAppendedPms((prev) => [newRow, ...prev])
  }

  const machineOptions = React.useMemo(
    () => machines.map((m) => ({ id: m.id, name: m.name })),
    [machines]
  )

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button size="sm" onClick={() => setPmModalOpen(true)}>
          <Plus weight="bold" />
          Schedule PM
        </Button>
      </div>

      <KpiRow>
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </KpiRow>

      <PmScheduleTable rows={allPms} />

      <MachineHealthGrid machines={machines} />

      <SchedulePmModal
        open={pmModalOpen}
        onOpenChange={setPmModalOpen}
        machines={machineOptions}
        onConfirm={handleConfirmPm}
      />
    </div>
  )
}

/* ---------- PM Schedule Table ------------------------------------------- */

function PmScheduleTable({ rows }: { rows: PmRow[] }) {
  const cols =
    "grid-cols-[110px_minmax(220px,2fr)_140px_80px_90px_80px_120px]"
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">PM Schedule Timeline</div>
          <div className="text-[11px] text-muted-foreground">
            Sorted by urgency · Overdue → Scheduled
          </div>
        </div>
        <HelpTooltip>
          <p className="text-xs">
            <strong>Priority</strong> reflects production impact. <strong>Conflicts</strong> count active jobs overlapping the PM window.
          </p>
          <p className="text-xs mt-1">
            <strong>PM types:</strong> Preventive (scheduled), Predictive (sensor-driven), Inspection (visual / regulatory).
          </p>
        </HelpTooltip>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div
            className={cn(
              "grid items-center gap-3 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40 border-t border-border",
              cols
            )}
          >
            <span>Machine</span>
            <span>Description</span>
            <span>Window</span>
            <span className="text-right">Duration</span>
            <span>Priority</span>
            <span className="text-right">Conflicts</span>
            <span>Status</span>
          </div>
          {rows.length === 0 && (
            <div className="px-5 py-10 text-sm text-muted-foreground text-center border-t border-border">
              No PM events scheduled.
            </div>
          )}
          {rows.map((r, i) => (
            <div
              key={`${r.machineId}-${r.windowStart}-${i}`}
              className={cn(
                "grid items-center gap-3 px-5 py-3 border-t border-border text-sm",
                cols
              )}
            >
              <span className="font-medium tabular-nums">{r.machineId}</span>
              <span className="text-muted-foreground truncate">
                {r.description}
              </span>
              <span className="text-xs tabular-nums">
                {fmtRange(r.windowStart, r.windowEnd)}
              </span>
              <span className="text-right tabular-nums text-xs">
                {r.durationHrs}h
              </span>
              <span className={cn("text-xs", PRIORITY_CLASS[r.priority])}>
                {r.priority}
              </span>
              <span
                className={cn(
                  "text-right tabular-nums text-xs",
                  r.conflictsCount > 0
                    ? "text-destructive font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {r.conflictsCount > 0 ? r.conflictsCount : "None"}
              </span>
              <span>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Machine Health Grid ----------------------------------------- */

function MachineHealthGrid({ machines }: { machines: MachineCard[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-semibold">Machine Health</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {machines.map((m) => (
          <MachineHealthCard key={m.id} machine={m} />
        ))}
      </div>
    </div>
  )
}

function MachineHealthCard({ machine: m }: { machine: MachineCard }) {
  const ratio = Math.min(1, m.spindleHours / Math.max(1, m.spindleHoursThreshold))
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{m.id}</span>
          <span className="text-xs text-muted-foreground truncate">
            {m.name}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">{m.type}</div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>Spindle hours</span>
          <span className="tabular-nums">
            {m.spindleHours} / {m.spindleHoursThreshold}
          </span>
        </div>
        <Progress
          value={ratio * 100}
          className="h-1.5"
          indicatorClassName={spindleFillClass(ratio)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-[11px] text-muted-foreground">Health score</div>
          <div className="text-base tabular-nums font-medium">
            {m.healthScore}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">Vibration</div>
          <div className={cn("text-sm font-medium", VIBRATION_CLASS[m.vibration])}>
            {m.vibration}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
        <span>Next PM {fmtDate(m.nextPmDate)}</span>
        <span className="tabular-nums">
          {m.openWorkOrders} WO · {m.hoursQueued}h queued
        </span>
      </div>
    </div>
  )
}

