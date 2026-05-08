"use client"

import * as React from "react"
import { Check, Question } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/* ---------- KpiCard ------------------------------------------------------ */

export interface KpiCardProps {
  label: string
  value: string
  delta?: { direction: "up" | "down"; amount: string }
  sub?: string
}

export type KpiSpec = KpiCardProps

export function KpiCard({ label, value, delta, sub }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl tabular-nums">{value}</div>
        {delta && (
          <span
            className={cn(
              "text-[11px] font-medium inline-flex items-center gap-0.5",
              delta.direction === "up" ? "text-emerald-600" : "text-rose-600"
            )}
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
  )
}

/* ---------- KpiRow ------------------------------------------------------- */

export function KpiRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  )
}

/* ---------- AiChip ------------------------------------------------------- */

export function AiChip({ tone = "primary" }: { tone?: "primary" | "translucent" }) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
        tone === "primary"
          ? "text-primary bg-primary/10"
          : "text-primary-foreground bg-primary-foreground/15"
      )}
    >
      AI
    </span>
  )
}

/* ---------- AiCallout ---------------------------------------------------- */

export interface AiCalloutProps {
  variant?: "default" | "banner" | "subtle"
  headline?: string
  body?: string
  action?: React.ReactNode
  children?: React.ReactNode
}

export function AiCallout({
  variant = "default",
  headline,
  body,
  action,
  children,
}: AiCalloutProps) {
  if (variant === "banner") {
    return (
      <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4">
        <AiChip tone="translucent" />
        <div className="flex-1 min-w-0">
          {headline && (
            <div className="text-sm font-semibold">{headline}</div>
          )}
          {body && (
            <div className="text-xs opacity-80 mt-0.5">{body}</div>
          )}
          {children}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )
  }

  if (variant === "subtle") {
    return (
      <div className="bg-muted/40 border-l-2 border-primary rounded-md p-4">
        <div className="flex items-start gap-2">
          <AiChip />
          <div className="flex-1 min-w-0">
            {headline && (
              <div className="text-sm font-semibold">{headline}</div>
            )}
            {body && (
              <div className="text-xs text-muted-foreground mt-1">{body}</div>
            )}
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start gap-2">
        <AiChip />
        <div className="flex-1 min-w-0">
          {headline && (
            <div className="text-sm font-semibold">{headline}</div>
          )}
          {body && (
            <div className="text-xs text-muted-foreground mt-1">{body}</div>
          )}
          {children}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

/* ---------- AiProcessingSteps ------------------------------------------- */

export type ProcessingStepStatus = "pending" | "active" | "done"

export interface ProcessingStep {
  label: string
  status: ProcessingStepStatus
}

export function AiProcessingSteps({ steps }: { steps: ProcessingStep[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center justify-center size-5 rounded-full shrink-0",
              step.status === "done" && "bg-primary text-primary-foreground",
              step.status === "active" &&
                "bg-primary text-primary-foreground animate-pulse",
              step.status === "pending" && "bg-muted"
            )}
            aria-hidden
          >
            {step.status === "done" && (
              <Check className="size-3.5" weight="bold" />
            )}
            {step.status === "pending" && (
              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            )}
          </span>
          <span
            className={cn(
              "text-sm",
              step.status === "pending"
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Formatters --------------------------------------------------- */

export const fmtUsd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

export const fmtDate = (iso: string) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export const fmtRange = (start: string, end: string) =>
  start === end ? fmtDate(start) : `${fmtDate(start)} – ${fmtDate(end)}`

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const addDaysIso = (iso: string, days: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const daysBetween = (start: string, end: string) => {
  if (!start || !end) return 1
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 1
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1)
}

/* ---------- useProcessingAnimation --------------------------------------- */

export function useProcessingAnimation(
  labels: readonly string[],
  isActive: boolean,
  intervalMs = 1200,
): { steps: ProcessingStep[]; isDone: boolean } {
  const [statuses, setStatuses] = React.useState<ProcessingStep["status"][]>(
    () => labels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"])
  )
  const [isDone, setIsDone] = React.useState(false)

  React.useEffect(() => {
    if (!isActive) return
    const count = labels.length
    setIsDone(false)
    setStatuses(labels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"]))
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => {
        setStatuses((prev) => {
          const next = [...prev] as ProcessingStep["status"][]
          next[i] = "done"
          if (i + 1 < count) next[i + 1] = "active"
          return next
        })
      }, (i + 1) * intervalMs))
    }
    timers.push(setTimeout(() => setIsDone(true), count * intervalMs + 600))
    return () => timers.forEach(clearTimeout)
  }, [isActive, labels, intervalMs])

  const steps: ProcessingStep[] = labels.map((label, i) => ({
    label, status: statuses[i],
  }))

  return { steps, isDone }
}

/* ---------- HelpTooltip -------------------------------------------------- */

export function HelpTooltip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground cursor-help"
            aria-label="Help"
          >
            <Question className="size-3.5" weight="light" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
