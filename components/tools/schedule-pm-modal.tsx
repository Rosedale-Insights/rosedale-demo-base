"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AiCallout,
  AiProcessingSteps,
  type ProcessingStep,
} from "./_shared"

/* ---------- Types -------------------------------------------------------- */

export type PmType = "Preventive" | "Predictive" | "Inspection"
export type PmDuration = "4 hrs" | "8 hrs" | "1 day" | "2 days"
export type PmServiceProvider = "In-House" | "OEM" | "Third-Party"

export interface ScheduledPmEvent {
  machineId: string
  pmType: string
  windowStart: string
  windowEnd: string
  durationLabel: string
  serviceProvider: string
}

export interface SchedulePmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machines: Array<{ id: string; name: string }>
  onConfirm: (event: ScheduledPmEvent) => void
  pmTypes?: string[]
  durations?: string[]
  serviceProviders?: string[]
  processingLabels?: string[]
  checklistItems?: string[]
  customerPool?: string[]
  reroutePool?: string[]
}

/* ---------- Helpers / defaults ------------------------------------------ */

const PM_TYPES: PmType[] = ["Preventive", "Predictive", "Inspection"]
const DURATIONS: PmDuration[] = ["4 hrs", "8 hrs", "1 day", "2 days"]
const PROVIDERS: PmServiceProvider[] = ["In-House", "OEM", "Third-Party"]

const PROCESSING_LABELS = [
  "Checking production schedule",
  "Identifying job conflicts",
  "Evaluating rerouting options",
  "Calculating cost impact",
] as const

const PM_CHECKLIST = [
  "Spindle bearing inspection",
  "Lubrication check",
  "Axis alignment verification",
  "Runout calibration",
  "Coolant flush",
] as const

const CUSTOMER_POOL = [
  "Aerospace Dynamics",
  "Northvane Aero",
  "Trident Metalworks",
  "Skyline Defense",
  "Precision Medical",
  "Global Robotics",
]

const REROUTE_POOL = ["CNC-01", "CNC-02", "5AX-01", "LAT-01", "HAAS-03"]

const fmtUsd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const todayIso = () => new Date().toISOString().slice(0, 10)
const addDaysIso = (iso: string, days: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const daysBetween = (start: string, end: string) => {
  if (!start || !end) return 1
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 1
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1)
}

const fmtDate = (iso: string) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/* ---------- Mock derivation --------------------------------------------- */

interface AffectedJob {
  jobId: string
  customer: string
  delayDays: number
  reroute: string | null
}

interface CostBreakdown {
  plannedPmCost: number
  unplannedRiskPerHour: number
  totalDelayDays: number
  narrative: string
}

function deriveAffectedJobs(
  machineId: string,
  days: number,
  customers: string[],
  reroutes: string[],
): AffectedJob[] {
  const seed = (machineId.charCodeAt(machineId.length - 1) || 60) + days * 3
  const count = Math.min(4, Math.max(0, days - 1 + (seed % 3)))
  const out: AffectedJob[] = []
  for (let i = 0; i < count; i++) {
    const k = seed + i * 7
    const reroutable = (k % 3) !== 0
    out.push({
      jobId: `WO-${4800 + ((k * 13) % 200)}`,
      customer: customers[(k * 5) % customers.length],
      delayDays: 1 + ((k * 2) % Math.max(1, days)),
      reroute: reroutable ? reroutes[(k * 11) % reroutes.length] : null,
    })
  }
  return out
}

function deriveCostSummary(
  machineId: string,
  pmType: string,
  duration: string,
  days: number,
  affected: AffectedJob[]
): CostBreakdown {
  const durationCost: Record<string, number> = {
    "4 hrs": 1200,
    "8 hrs": 2400,
    "1 day": 4800,
    "2 days": 8400,
  }
  const typeMultiplier: Record<string, number> = {
    Preventive: 1,
    Predictive: 1.15,
    Inspection: 0.7,
  }
  const parsedCost = durationCost[duration] ?? (parseFloat(duration) || 1) * 2400
  const plannedPmCost = Math.round(
    parsedCost * (typeMultiplier[pmType] ?? 1)
  )
  const seed = machineId.charCodeAt(0) || 60
  const unplannedRiskPerHour = 1500 + ((seed * 17) % 1200)
  const totalDelayDays = affected.reduce((s, j) => s + j.delayDays, 0) + days

  const narrative =
    affected.length === 0
      ? `This window is clean — no active jobs are running on ${machineId} during the selected dates. Recommended go-ahead.`
      : `${affected.length} active job${affected.length === 1 ? "" : "s"} overlap this window on ${machineId}. ${
          affected.filter((a) => a.reroute).length
        } can reroute to a sister machine. Estimated total production delay is ${totalDelayDays} day${totalDelayDays === 1 ? "" : "s"}.`

  return { plannedPmCost, unplannedRiskPerHour, totalDelayDays, narrative }
}

interface FormState {
  machineId: string
  pmType: string
  windowStart: string
  windowEnd: string
  duration: string
  serviceProvider: string
}

function defaultForm(
  machines: SchedulePmModalProps["machines"],
  pmTypes: string[],
  durations: string[],
  serviceProviders: string[],
): FormState {
  const start = addDaysIso(todayIso(), 7)
  return {
    machineId: machines[0]?.id ?? "",
    pmType: pmTypes[0] ?? "Preventive",
    windowStart: start,
    windowEnd: addDaysIso(start, 1),
    duration: durations[1] ?? durations[0] ?? "8 hrs",
    serviceProvider: serviceProviders[0] ?? "In-House",
  }
}

export default function SchedulePmModal({
  open,
  onOpenChange,
  machines,
  onConfirm,
  pmTypes = PM_TYPES,
  durations = DURATIONS,
  serviceProviders = PROVIDERS,
  processingLabels = PROCESSING_LABELS as unknown as string[],
  checklistItems = PM_CHECKLIST as unknown as string[],
  customerPool = CUSTOMER_POOL,
  reroutePool = REROUTE_POOL,
}: SchedulePmModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [form, setForm] = React.useState<FormState>(() =>
    defaultForm(machines, pmTypes, durations, serviceProviders)
  )
  const [stepStatuses, setStepStatuses] = React.useState<
    ProcessingStep["status"][]
  >(() => processingLabels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"]))
  const [checklist, setChecklist] = React.useState<boolean[]>(
    () => checklistItems.map(() => false)
  )

  React.useEffect(() => {
    if (!open) return
    setStep(1)
    setForm(defaultForm(machines, pmTypes, durations, serviceProviders))
    setChecklist(checklistItems.map(() => false))
    setStepStatuses(processingLabels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"]))
  }, [open, machines, pmTypes, durations, serviceProviders, checklistItems, processingLabels])

  React.useEffect(() => {
    if (step !== 2) return
    const count = processingLabels.length
    setStepStatuses(processingLabels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"]))
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => {
          setStepStatuses((prev) => {
            const next = [...prev] as ProcessingStep["status"][]
            next[i] = "done"
            if (i + 1 < count) next[i + 1] = "active"
            return next
          })
        }, (i + 1) * 1100)
      )
    }
    timers.push(setTimeout(() => setStep(3), count * 1100 + 600))
    return () => timers.forEach(clearTimeout)
  }, [step, processingLabels])

  const days = daysBetween(form.windowStart, form.windowEnd)
  const affected = React.useMemo(
    () => deriveAffectedJobs(form.machineId, days, customerPool, reroutePool),
    [form.machineId, days, customerPool, reroutePool]
  )
  const cost = React.useMemo(
    () =>
      deriveCostSummary(
        form.machineId,
        form.pmType,
        form.duration,
        days,
        affected
      ),
    [form.machineId, form.pmType, form.duration, days, affected]
  )

  const processingSteps: ProcessingStep[] = processingLabels.map(
    (label, i) => ({ label, status: stepStatuses[i] })
  )

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleConfirm = () => {
    onConfirm({
      machineId: form.machineId,
      pmType: form.pmType,
      windowStart: form.windowStart,
      windowEnd: form.windowEnd,
      durationLabel: form.duration,
      serviceProvider: form.serviceProvider,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Schedule preventive maintenance"}
            {step === 2 && "Analyzing schedule impact"}
            {step === 3 && "PM analysis review"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 &&
              "Choose machine, window, and provider. AI will analyze production impact."}
            {step === 2 &&
              "Cross-referencing the production schedule for conflicts and reroutes…"}
            {step === 3 &&
              "Confirm to add this PM to the schedule, or adjust the window."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <ConfigureForm
            form={form}
            machines={machines}
            setField={setField}
            pmTypes={pmTypes}
            durations={durations}
            serviceProviders={serviceProviders}
          />
        )}
        {step === 2 && (
          <div className="py-6 px-2">
            <AiProcessingSteps steps={processingSteps} />
          </div>
        )}
        {step === 3 && (
          <ReviewBody
            form={form}
            affected={affected}
            cost={cost}
            checklist={checklist}
            setChecklist={setChecklist}
            checklistItems={checklistItems}
          />
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!form.machineId || !form.windowStart || !form.windowEnd}
              >
                Analyze schedule
              </Button>
            </>
          )}
          {step === 2 && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step === 3 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Try different window
              </Button>
              <Button onClick={handleConfirm}>Confirm schedule</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Step 1 — ConfigureForm -------------------------------------- */

function ConfigureForm({
  form,
  machines,
  setField,
  pmTypes,
  durations,
  serviceProviders,
}: {
  form: FormState
  machines: SchedulePmModalProps["machines"]
  setField: <K extends keyof FormState>(key: K, val: FormState[K]) => void
  pmTypes: string[]
  durations: string[]
  serviceProviders: string[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="pm-machine">Machine</Label>
        <Select
          value={form.machineId}
          onValueChange={(v) => setField("machineId", v)}
        >
          <SelectTrigger id="pm-machine">
            <SelectValue placeholder="Select a machine" />
          </SelectTrigger>
          <SelectContent>
            {machines.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.id} — {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>PM type</Label>
        <ToggleGroup
          type="single"
          size="sm"
          value={form.pmType}
          onValueChange={(v) => v && setField("pmType", v)}
        >
          {pmTypes.map((t) => (
            <ToggleGroupItem key={t} value={t}>
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pm-start">Start date</Label>
        <Input
          id="pm-start"
          type="date"
          value={form.windowStart}
          onChange={(e) => setField("windowStart", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pm-end">End date</Label>
        <Input
          id="pm-end"
          type="date"
          value={form.windowEnd}
          min={form.windowStart}
          onChange={(e) => setField("windowEnd", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pm-duration">Estimated duration</Label>
        <Select
          value={form.duration}
          onValueChange={(v) => setField("duration", v)}
        >
          <SelectTrigger id="pm-duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durations.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Service provider</Label>
        <ToggleGroup
          type="single"
          size="sm"
          value={form.serviceProvider}
          onValueChange={(v) => v && setField("serviceProvider", v)}
        >
          {serviceProviders.map((p) => (
            <ToggleGroupItem key={p} value={p}>
              {p}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}

/* ---------- Step 3 — ReviewBody ----------------------------------------- */

function ReviewBody({
  form,
  affected,
  cost,
  checklist,
  setChecklist,
  checklistItems,
}: {
  form: FormState
  affected: AffectedJob[]
  cost: CostBreakdown
  checklist: boolean[]
  setChecklist: React.Dispatch<React.SetStateAction<boolean[]>>
  checklistItems: string[]
}) {
  return (
    <div className="flex flex-col gap-5">
      <AiCallout
        variant="default"
        headline={`${form.machineId} · ${form.pmType} · ${fmtDate(form.windowStart)} – ${fmtDate(form.windowEnd)}`}
        body={cost.narrative}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="text-sm font-semibold mb-2">Jobs affected</div>
          <AffectedJobsTable jobs={affected} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-semibold mb-2">Cost summary</div>
            <CostSummary cost={cost} />
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">PM checklist</div>
            <ul className="bg-card border border-border rounded-md divide-y divide-border">
              {checklistItems.map((item, i) => (
                <li key={item} className="flex items-center gap-2 px-3 py-2">
                  <Checkbox
                    id={`pm-task-${i}`}
                    checked={checklist[i]}
                    onCheckedChange={(v) =>
                      setChecklist((prev) => {
                        const next = [...prev]
                        next[i] = Boolean(v)
                        return next
                      })
                    }
                  />
                  <label
                    htmlFor={`pm-task-${i}`}
                    className={cn(
                      "text-sm cursor-pointer flex-1",
                      checklist[i] && "line-through text-muted-foreground"
                    )}
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- AffectedJobsTable ------------------------------------------- */

function AffectedJobsTable({ jobs }: { jobs: AffectedJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-md px-3 py-6 text-sm text-muted-foreground text-center">
        None — window is clear.
      </div>
    )
  }
  const cols = "grid-cols-[1fr_1.4fr_60px_80px]"
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div
        className={cn(
          "grid gap-2 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40",
          cols
        )}
      >
        <span>Job ID</span>
        <span>Customer</span>
        <span className="text-right">Delay</span>
        <span className="text-right">Reroute</span>
      </div>
      {jobs.map((j) => (
        <div
          key={j.jobId}
          className={cn(
            "grid gap-2 px-3 py-2 text-xs border-t border-border items-center",
            cols
          )}
        >
          <span className="font-medium">{j.jobId}</span>
          <span className="text-muted-foreground truncate">{j.customer}</span>
          <span className="text-right tabular-nums">{j.delayDays}d</span>
          <span
            className={cn(
              "text-right text-[11px] font-medium",
              j.reroute ? "text-emerald-700" : "text-rose-700"
            )}
          >
            {j.reroute ?? "No"}
          </span>
        </div>
      ))}
    </div>
  )
}

function CostSummary({ cost }: { cost: CostBreakdown }) {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="grid grid-cols-2 px-3 py-2 text-sm border-b border-border">
        <span className="text-muted-foreground">Planned PM cost</span>
        <span className="text-right tabular-nums font-medium">
          {fmtUsd(cost.plannedPmCost)}
        </span>
      </div>
      <div className="grid grid-cols-2 px-3 py-2 text-sm border-b border-border">
        <span className="text-muted-foreground">Unplanned downtime risk</span>
        <span className="text-right tabular-nums font-medium text-destructive">
          {fmtUsd(cost.unplannedRiskPerHour)}/hr
        </span>
      </div>
      <div className="grid grid-cols-2 px-3 py-2.5 text-sm bg-primary text-primary-foreground">
        <span className="opacity-90">Total delay</span>
        <span className="text-right tabular-nums font-semibold">
          {cost.totalDelayDays} day{cost.totalDelayDays === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  )
}
