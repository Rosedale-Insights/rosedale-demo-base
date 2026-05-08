"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AiCallout,
  HelpTooltip,
  KpiCard,
  KpiRow,
  fmtUsd,
  fmtDate,
  type KpiSpec,
} from "./_shared"

/* ---------- Types -------------------------------------------------------- */

export type FindingSeverity = "Critical" | "High" | "Medium" | "Low"
export type FindingStatus = "New" | "Under Review" | "Confirmed" | "Dismissed" | "Resolved"

export interface Finding {
  id: string
  title: string
  severity: FindingSeverity
  dollarImpact: number
  type: string
  detectedAt: string
  status: FindingStatus
  aiSummary: string
  evidence: Array<{ label: string; value: string }>
}

export interface SavingsSummary {
  ytdRealized: number
  identified: number
  breakdown: Array<{ label: string; amount: number }>
}

export interface VigilantControllerProps {
  title: string
  subtitle: string
  kpis: KpiSpec[]
  findings: Finding[]
  savings: SavingsSummary
}

/* ---------- Constants ---------------------------------------------------- */

const SEVERITY_CLASS: Record<FindingSeverity, string> = {
  Critical: "text-destructive font-semibold",
  High: "text-amber-700 font-semibold",
  Medium: "text-foreground",
  Low: "text-muted-foreground",
}

const STATUS_VARIANT: Record<
  FindingStatus,
  "default" | "secondary" | "destructive" | "outline" | "muted"
> = {
  New: "default",
  "Under Review": "secondary",
  Confirmed: "outline",
  Dismissed: "muted",
  Resolved: "muted",
}

/* ---------- Tool --------------------------------------------------------- */

export default function VigilantController(props: VigilantControllerProps) {
  const { title, subtitle, kpis, findings, savings } = props

  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [statusOverrides, setStatusOverrides] = React.useState<
    Record<string, FindingStatus>
  >({})

  const effectiveStatus = React.useCallback(
    (f: Finding): FindingStatus => statusOverrides[f.id] ?? f.status,
    [statusOverrides]
  )

  const applyAction = React.useCallback(
    (id: string, next: FindingStatus) => {
      setStatusOverrides((prev) => ({ ...prev, [id]: next }))
      setExpandedId(null)
    },
    []
  )

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="text-2xl">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <KpiRow>
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </KpiRow>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column — Anomaly Feed */}
        <AnomalyFeed
          findings={findings}
          expandedId={expandedId}
          onToggle={(id) =>
            setExpandedId((curr) => (curr === id ? null : id))
          }
          effectiveStatus={effectiveStatus}
          onAction={applyAction}
        />

        {/* Right column — Savings Summary */}
        <SavingsSidebar savings={savings} />
      </div>
    </div>
  )
}

/* ---------- Anomaly Feed ------------------------------------------------- */

function AnomalyFeed({
  findings,
  expandedId,
  onToggle,
  effectiveStatus,
  onAction,
}: {
  findings: Finding[]
  expandedId: string | null
  onToggle: (id: string) => void
  effectiveStatus: (f: Finding) => FindingStatus
  onAction: (id: string, next: FindingStatus) => void
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <div className="text-sm font-semibold">Anomaly Feed</div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {findings.length} findings
        </span>
        <div className="ml-auto">
          <HelpTooltip>
            <p className="text-xs">
              <strong>Severity scale:</strong> Critical = immediate revenue
              risk, High = likely loss if unresolved, Medium = warrants
              investigation, Low = informational.
            </p>
          </HelpTooltip>
        </div>
      </div>

      <div className="flex flex-col">
        {findings.length === 0 && (
          <div className="px-5 py-10 text-sm text-muted-foreground text-center border-t border-border">
            No anomalies detected.
          </div>
        )}
        {findings.map((f) => {
          const status = effectiveStatus(f)
          const expanded = expandedId === f.id
          const dimmed = expandedId !== null && expandedId !== f.id

          return (
            <React.Fragment key={f.id}>
              <button
                type="button"
                onClick={() => onToggle(f.id)}
                aria-expanded={expanded}
                aria-label={`${f.title} — ${f.severity}, ${expanded ? "collapse" : "expand"} details`}
                className={cn(
                  "w-full text-left px-5 py-3 border-t border-border transition-opacity",
                  dimmed ? "opacity-40" : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium truncate">
                    {f.title}
                  </span>
                  <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
                  <span className={SEVERITY_CLASS[f.severity]}>
                    {f.severity}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {fmtUsd(f.dollarImpact)}
                  </span>
                  <span className="text-muted-foreground">{f.type}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {fmtDate(f.detectedAt)}
                  </span>
                </div>
              </button>

              {expanded && (
                <FindingDetail
                  finding={f}
                  onAction={(next) => onAction(f.id, next)}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Finding Detail (inline triage) ------------------------------- */

function FindingDetail({
  finding,
  onAction,
}: {
  finding: Finding
  onAction: (next: FindingStatus) => void
}) {
  return (
    <div className="mx-4 mb-3 p-4 bg-muted/40 rounded-md border-l-2 border-primary">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {finding.evidence.map((e) => (
          <div key={e.label}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {e.label}
            </div>
            <div className="text-sm">{e.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <AiCallout variant="subtle" body={finding.aiSummary} />
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={(ev) => {
            ev.stopPropagation()
            onAction("Dismissed")
          }}
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-primary"
          onClick={(ev) => {
            ev.stopPropagation()
            onAction("Confirmed")
          }}
        >
          Confirm Finding
        </Button>
        <Button
          size="sm"
          onClick={(ev) => {
            ev.stopPropagation()
            onAction("Resolved")
          }}
        >
          Resolve
        </Button>
      </div>
    </div>
  )
}

/* ---------- Savings Sidebar ---------------------------------------------- */

function SavingsSidebar({ savings }: { savings: SavingsSummary }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5 h-fit">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          YTD Realized
        </div>
        <div className="text-3xl tabular-nums mt-0.5">
          {fmtUsd(savings.ytdRealized)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Identified
          </div>
          <div className="text-xl tabular-nums mt-0.5">
            {fmtUsd(savings.identified)}
          </div>
        </div>
        <HelpTooltip>
          <p className="text-xs">
            <strong>Realized</strong> savings are confirmed and closed.{" "}
            <strong>Identified</strong> savings are from open findings not
            yet acted on.
          </p>
        </HelpTooltip>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Breakdown by Type</div>
        <ul className="divide-y divide-border">
          {savings.breakdown.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="tabular-nums font-medium">
                {fmtUsd(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
