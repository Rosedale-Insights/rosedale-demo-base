"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CaretDown,
  Clock,
  Eye,
  PaperPlaneTilt,
  PencilSimple,
  Plus,
  Trophy,
  UploadSimple,
  XCircle,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
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
  AiCallout,
  AiProcessingSteps,
  HelpTooltip,
  KpiCard,
  KpiRow,
  type KpiCardProps,
  type ProcessingStep,
} from "./_shared"

/* ---------- Types -------------------------------------------------------- */

export type QuoteStatus = "Draft" | "Review" | "Sent" | "Won" | "Lost" | "Expired"

export interface QuoteRow {
  id: string
  client: string
  quoteId: string
  project: string
  amount: number
  margin: number
  confidence: number
  status: QuoteStatus
}

export interface KpiSpec extends KpiCardProps {}

export interface CostBreakdownItem { name: string; value: number }
export interface OpRow { step: string; description: string; hours: number; cost: number }
export interface SimilarJob { client: string; project: string; amount: number; margin: number }

export interface QuoteBuilderPresets {
  customer?: string
  material?: string
  partDescription?: string
  quantity?: number
  costBreakdown?: CostBreakdownItem[]
  operations?: OpRow[]
  similarJobs?: SimilarJob[]
  aiNarrative?: string
  baseUnitCost?: number
}

export interface QuotingToolProps {
  title: string
  subtitle: string
  kpis: [KpiSpec, KpiSpec, KpiSpec, KpiSpec]
  quotes: QuoteRow[]
  lineItemPresets?: QuoteBuilderPresets
  aiBannerHeadline: string
  aiBannerBody: string
  aiBannerActionLabel?: string
  processingLabels?: string[]
}

/* ---------- Helpers / defaults ------------------------------------------ */

const FILTER_TABS = ["All", "Draft", "Review", "Sent", "Won", "Lost", "Expired"] as const
type FilterTab = (typeof FILTER_TABS)[number]

const STATUS_CHIP: Record<QuoteStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Review: "bg-sky-50 text-sky-700",
  Sent: "bg-amber-50 text-amber-700",
  Won: "bg-emerald-50 text-emerald-700",
  Lost: "bg-rose-50 text-rose-700",
  Expired: "bg-muted text-muted-foreground",
}

const STATUS_ICON: Record<QuoteStatus, React.ElementType> = {
  Draft: PencilSimple, Review: Eye, Sent: PaperPlaneTilt,
  Won: Trophy, Lost: XCircle, Expired: Clock,
}

const marginIndicatorClass = (m: number) =>
  m >= 25 ? "bg-emerald-500" : m >= 15 ? "bg-amber-500" : "bg-rose-500"

const fmtUsd = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const COST_BAR_FILLS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const DEFAULT_COST_BREAKDOWN: CostBreakdownItem[] = [
  { name: "Material", value: 2220 }, { name: "Machine time", value: 4290 },
  { name: "Labor", value: 1140 }, { name: "Setup", value: 680 },
  { name: "Tooling", value: 390 }, { name: "Outside svc", value: 540 },
  { name: "Overhead", value: 2106 },
]

const DEFAULT_OPERATIONS: OpRow[] = [
  { step: "Setup", description: "Fixturing + first article", hours: 2.5, cost: 320 },
  { step: "Roughing", description: "5-axis Ti material removal", hours: 4.0, cost: 1280 },
  { step: "Finishing", description: "Critical surfaces +/-0.0005", hours: 3.5, cost: 1120 },
  { step: "Inspection", description: "CMM verification", hours: 1.0, cost: 180 },
]

const DEFAULT_SIMILAR_JOBS: SimilarJob[] = [
  { client: "Trident Metalworks", project: "Turbine blade root fittings", amount: 67200, margin: 34.2 },
  { client: "Northvane Aero", project: "Titanium bracket assembly", amount: 42800, margin: 26.8 },
  { client: "Aerospace Dynamics", project: "Compressor stage rings", amount: 18900, margin: 29.1 },
]


const DEFAULT_AI_NARRATIVE =
  "Based on 3 similar Ti-6Al-4V jobs in the last 6 months, this quote is priced 4% above market median. Confidence is high — material spec, tolerance band, and quantity all match recent won jobs."

const STEP_LABELS = [
  "Analyzing material costs",
  "Checking similar jobs",
  "Computing operations routing",
  "Validating margin targets",
] as const

/* ---------- Tool --------------------------------------------------------- */

export default function QuotingTool(props: QuotingToolProps) {
  const {
    title, subtitle, kpis, quotes: seedQuotes, lineItemPresets,
    aiBannerHeadline, aiBannerBody, aiBannerActionLabel = "Apply suggestion",
    processingLabels = STEP_LABELS as unknown as string[],
  } = props

  const [quotes, setQuotes] = React.useState<QuoteRow[]>(seedQuotes)
  const [activeTab, setActiveTab] = React.useState<FilterTab>("All")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [bannerDismissed, setBannerDismissed] = React.useState(false)
  const [modalOpen, setModalOpen] = React.useState(false)

  const visibleQuotes = React.useMemo(
    () => (activeTab === "All" ? quotes : quotes.filter((q) => q.status === activeTab)),
    [quotes, activeTab]
  )

  const addQuote = (r: BuilderResult, status: QuoteStatus) => {
    setQuotes((prev) => [
      {
        id: `q-${Date.now()}`,
        client: r.customer || "New customer",
        quoteId: `QT-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        project: r.partDescription || "New quote",
        amount: r.totalPrice,
        margin: r.margin,
        confidence: 82,
        status,
      },
      ...prev,
    ])
    setActiveTab(status)
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus weight="bold" />
          New quote
        </Button>
      </div>

      <KpiRow>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </KpiRow>

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={tab === activeTab ? "outline" : "ghost"}
            className="text-xs"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1 text-muted-foreground tabular-nums">
                {quotes.filter((q) => q.status === tab).length}
              </span>
            )}
          </Button>
        ))}
        <div className="ml-auto">
          <HelpTooltip>
            <p className="text-xs">
              <strong>Margin</strong> is the projected gross margin %. <strong>Confidence</strong> is the AI&rsquo;s certainty in the cost estimate based on similar past jobs.
            </p>
          </HelpTooltip>
        </div>
      </div>

      <QuoteTable
        quotes={visibleQuotes}
        expandedId={expandedId}
        onToggle={(id) => setExpandedId((curr) => (curr === id ? null : id))}
        presets={lineItemPresets}
      />

      {!bannerDismissed && (
        <AiCallout
          variant="banner"
          headline={aiBannerHeadline}
          body={aiBannerBody}
          action={
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setBannerDismissed(true)}
            >
              {aiBannerActionLabel}
            </Button>
          }
        />
      )}

      <QuoteBuilderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        presets={lineItemPresets}
        processingLabels={processingLabels}
        onSaveDraft={(r) => addQuote(r, "Draft")}
        onSendToCustomer={(r) => addQuote(r, "Sent")}
      />
    </div>
  )
}

/* ---------- QuoteTable --------------------------------------------------- */

function QuoteTable({
  quotes,
  expandedId,
  onToggle,
  presets,
}: {
  quotes: QuoteRow[]
  expandedId: string | null
  onToggle: (id: string) => void
  presets?: QuoteBuilderPresets
}) {
  const cols = "grid-cols-[24px_1.6fr_2fr_1fr_1.2fr_80px_100px]"
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className={cn("grid items-center gap-4 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40", cols)}>
            <span /><span>Client &amp; ID</span><span>Project</span>
            <span className="text-right">Amount</span>
            <span>Margin</span>
            <span className="text-right">Conf.</span>
            <span>Status</span>
          </div>
          {quotes.length === 0 && (
            <div className="px-5 py-10 text-sm text-muted-foreground text-center">
              No quotes match this filter.
            </div>
          )}
          {quotes.map((q) => {
            const StatusIcon = STATUS_ICON[q.status]
            const expanded = expandedId === q.id
            return (
              <React.Fragment key={q.id}>
                <button
                  type="button"
                  onClick={() => onToggle(q.id)}
                  aria-expanded={expanded}
                  className={cn("w-full text-left grid items-center gap-4 px-5 py-3 border-t border-border hover:bg-muted/30 transition-colors", cols)}
                >
                  <CaretDown weight="regular" className={cn("size-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{q.client}</div>
                    <div className="text-[11px] text-muted-foreground">{q.quoteId}</div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{q.project}</div>
                  <div className="text-sm text-right tabular-nums font-medium">{fmtUsd(q.amount)}</div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={Math.min((q.margin / 40) * 100, 100)}
                      className="h-1.5 w-12"
                      indicatorClassName={marginIndicatorClass(q.margin)}
                    />
                    <span className="text-xs text-muted-foreground tabular-nums">{q.margin.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-right tabular-nums text-muted-foreground">{q.confidence}%</div>
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-md w-fit inline-flex items-center gap-1", STATUS_CHIP[q.status])}>
                    <StatusIcon className="size-3" weight="regular" />
                    {q.status}
                  </span>
                </button>
                {expanded && <ExpandedRowDetail row={q} presets={presets} />}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Cost chart + ops + similar jobs (shared sub-components) ----- */

function CostChart({ data, height = 220, barSize = 14 }: { data: CostBreakdownItem[]; height?: number; barSize?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={96} />
          <RechartsTooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={barSize}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COST_BAR_FILLS[i % COST_BAR_FILLS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function OperationsTable({ rows }: { rows: OpRow[] }) {
  const cols = "grid-cols-[1fr_2fr_60px_80px]"
  return (
    <div>
      <div className="text-sm font-semibold mb-2">Operations routing</div>
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className={cn("grid gap-2 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40", cols)}>
          <span>Step</span><span>Description</span>
          <span className="text-right">Hrs</span>
          <span className="text-right">Cost</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className={cn("grid gap-2 px-3 py-2 text-xs border-t border-border", cols)}>
            <span className="font-medium">{r.step}</span>
            <span className="text-muted-foreground truncate">{r.description}</span>
            <span className="text-right tabular-nums">{r.hours.toFixed(1)}</span>
            <span className="text-right tabular-nums">{fmtUsd(r.cost)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimilarJobsList({ jobs }: { jobs: SimilarJob[] }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">Similar past jobs</div>
      <ul className="bg-card border border-border rounded-md divide-y divide-border">
        {jobs.map((j, i) => (
          <li key={i} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <div className="text-sm truncate">{j.client}</div>
              <div className="text-[11px] text-muted-foreground truncate">{j.project}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm tabular-nums">{fmtUsd(j.amount)}</div>
              <div className="text-[11px] text-muted-foreground tabular-nums">{j.margin.toFixed(1)}% margin</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- ExpandedRowDetail ------------------------------------------- */

function ExpandedRowDetail({ row, presets }: { row: QuoteRow; presets?: QuoteBuilderPresets }) {
  const breakdown = presets?.costBreakdown ?? DEFAULT_COST_BREAKDOWN
  const operations = presets?.operations ?? DEFAULT_OPERATIONS
  const similarJobs = presets?.similarJobs ?? DEFAULT_SIMILAR_JOBS

  return (
    <div className="border-t border-border bg-muted/20 px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm font-semibold">Cost breakdown</div>
          <div className="text-[11px] text-muted-foreground">{row.client} · {row.quoteId}</div>
        </div>
        <CostChart data={breakdown} />
        <OperationsTable rows={operations} />
      </div>
      <div className="flex flex-col gap-4">
        <AiCallout variant="subtle" headline="Pricing analysis" body={presets?.aiNarrative ?? DEFAULT_AI_NARRATIVE} />
        <SimilarJobsList jobs={similarJobs} />
      </div>
    </div>
  )
}

/* ---------- Quote Builder Modal ----------------------------------------- */

interface FormFields {
  customer: string
  material: string
  partDescription: string
  quantity: number
  urgency: "Standard" | "Rush" | "AOG"
  certs: { as9100: boolean; itar: boolean; nadcap: boolean; iso9001: boolean }
}

interface BuilderResult {
  customer: string
  partDescription: string
  totalPrice: number
  margin: number
}

function QuoteBuilderModal({
  open,
  onOpenChange,
  presets,
  processingLabels,
  onSaveDraft,
  onSendToCustomer,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  presets?: QuoteBuilderPresets
  processingLabels: string[]
  onSaveDraft: (r: BuilderResult) => void
  onSendToCustomer: (r: BuilderResult) => void
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [form, setForm] = React.useState<FormFields>({
    customer: presets?.customer ?? "",
    material: presets?.material ?? "Ti-6Al-4V",
    partDescription: presets?.partDescription ?? "",
    quantity: presets?.quantity ?? 6,
    urgency: "Standard",
    certs: { as9100: true, itar: false, nadcap: false, iso9001: true },
  })
  const [marginPct, setMarginPct] = React.useState(28)
  const [stepStatuses, setStepStatuses] = React.useState<ProcessingStep["status"][]>(
    () => processingLabels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"])
  )

  React.useEffect(() => {
    if (!open) return
    setStep(1)
    setMarginPct(28)
    setStepStatuses(processingLabels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"]))
  }, [open, processingLabels])

  React.useEffect(() => {
    if (step !== 2) return
    const count = processingLabels.length
    setStepStatuses(processingLabels.map((_, i) => (i === 0 ? "active" : "pending") as ProcessingStep["status"]))
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => {
        setStepStatuses((prev) => {
          const next = [...prev] as ProcessingStep["status"][]
          next[i] = "done"
          if (i + 1 < count) next[i + 1] = "active"
          return next
        })
      }, (i + 1) * 1200))
    }
    timers.push(setTimeout(() => setStep(3), count * 1200 + 600))
    return () => timers.forEach(clearTimeout)
  }, [step, processingLabels])

  const breakdown = presets?.costBreakdown ?? DEFAULT_COST_BREAKDOWN
  const operations = presets?.operations ?? DEFAULT_OPERATIONS
  const similarJobs = presets?.similarJobs ?? DEFAULT_SIMILAR_JOBS

  const baseCostPerUnit = React.useMemo(() => {
    if (presets?.baseUnitCost) return presets.baseUnitCost
    return breakdown.reduce((sum, b) => sum + b.value, 0) / Math.max(form.quantity, 1)
  }, [breakdown, form.quantity, presets?.baseUnitCost])

  const unitPrice = baseCostPerUnit / (1 - marginPct / 100)
  const totalPrice = unitPrice * form.quantity
  const marginDollars = (unitPrice - baseCostPerUnit) * form.quantity

  const result: BuilderResult = {
    customer: form.customer,
    partDescription: form.partDescription,
    totalPrice: Math.round(totalPrice),
    margin: Math.round(marginPct * 10) / 10,
  }

  const processingSteps: ProcessingStep[] = processingLabels.map((label, i) => ({
    label, status: stepStatuses[i],
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "New quote — RFQ details"}
            {step === 2 && "Generating quote"}
            {step === 3 && "Review quote"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Enter request-for-quote details. AI will draft pricing in seconds."}
            {step === 2 && "Cross-referencing recent jobs and material costs..."}
            {step === 3 && "Adjust margin to set final price. Save as draft or send to customer."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && <RfqForm form={form} onChange={setForm} />}
        {step === 2 && (
          <div className="py-6 px-2"><AiProcessingSteps steps={processingSteps} /></div>
        )}
        {step === 3 && (
          <QuoteReview
            form={form}
            breakdown={breakdown}
            operations={operations}
            similarJobs={similarJobs}
            aiNarrative={presets?.aiNarrative ?? DEFAULT_AI_NARRATIVE}
            marginPct={marginPct}
            onMarginChange={setMarginPct}
            unitPrice={unitPrice}
            totalPrice={totalPrice}
            marginDollars={marginDollars}
          />
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep(2)}>Generate quote</Button>
            </>
          )}
          {step === 2 && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          )}
          {step === 3 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>← Back to form</Button>
              <Button variant="outline" onClick={() => onSaveDraft(result)}>Save as draft</Button>
              <Button onClick={() => onSendToCustomer(result)}>Send to customer</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- RfqForm ----------------------------------------------------- */

function RfqForm({ form, onChange }: { form: FormFields; onChange: (next: FormFields) => void }) {
  const set = <K extends keyof FormFields>(key: K, val: FormFields[K]) => onChange({ ...form, [key]: val })
  const certs = [
    ["as9100", "AS9100"], ["itar", "ITAR"], ["nadcap", "NADCAP"], ["iso9001", "ISO 9001"],
  ] as const

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="customer">Customer</Label>
        <Input id="customer" value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="Aerospace Dynamics" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="material">Material</Label>
        <Input id="material" value={form.material} onChange={(e) => set("material", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" min={1} value={form.quantity}
          onChange={(e) => set("quantity", Math.max(1, Number(e.target.value) || 1))} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="part-description">Part description</Label>
        <Input id="part-description" value={form.partDescription} onChange={(e) => set("partDescription", e.target.value)}
          placeholder="Titanium turbine housing, +/-0.0005 critical surfaces" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Urgency</Label>
        <ToggleGroup type="single" value={form.urgency} size="sm"
          onValueChange={(v) => v && set("urgency", v as FormFields["urgency"])}>
          <ToggleGroupItem value="Standard">Standard</ToggleGroupItem>
          <ToggleGroupItem value="Rush">Rush</ToggleGroupItem>
          <ToggleGroupItem value="AOG">AOG</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label>Certifications required</Label>
        <div className="grid grid-cols-2 gap-2">
          {certs.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={form.certs[key]} onCheckedChange={(v) => set("certs", { ...form.certs, [key]: Boolean(v) })} />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2 border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
        <UploadSimple className="size-5 mx-auto mb-2" weight="light" />
        Drop drawings &amp; CAD files here (PDF, STEP, DXF)
      </div>
    </div>
  )
}

/* ---------- QuoteReview ------------------------------------------------- */

function QuoteReview({
  form, breakdown, operations, similarJobs, aiNarrative,
  marginPct, onMarginChange, unitPrice, totalPrice, marginDollars,
}: {
  form: FormFields
  breakdown: CostBreakdownItem[]
  operations: OpRow[]
  similarJobs: SimilarJob[]
  aiNarrative: string
  marginPct: number
  onMarginChange: (v: number) => void
  unitPrice: number
  totalPrice: number
  marginDollars: number
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm font-semibold">Cost breakdown</div>
          <div className="text-[11px] text-muted-foreground">
            Per-unit estimate · {form.material} · {form.quantity} pcs
          </div>
        </div>
        <CostChart data={breakdown} height={200} barSize={12} />
        <OperationsTable rows={operations} />
      </div>

      <div className="flex flex-col gap-4">
        <AiCallout variant="subtle" headline="Pricing analysis" body={aiNarrative} />
        <SimilarJobsList jobs={similarJobs.slice(0, 3)} />

        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Target margin</Label>
            <span className="text-sm tabular-nums font-medium">{marginPct.toFixed(0)}%</span>
          </div>
          <Slider min={10} max={45} step={1} value={[marginPct]}
            onValueChange={(v) => onMarginChange(v[0] ?? marginPct)}
            aria-label="Target margin" />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground tabular-nums">
            <span>10%</span><span>45%</span>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground rounded-xl p-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: totalPrice },
            { label: "Per unit", value: unitPrice },
            { label: "Margin", value: marginDollars },
          ].map((tile) => (
            <div key={tile.label}>
              <div className="text-[10px] uppercase tracking-wider opacity-75">{tile.label}</div>
              <div className="text-xl tabular-nums font-semibold mt-0.5">{fmtUsd(tile.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
