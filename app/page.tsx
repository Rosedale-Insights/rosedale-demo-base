import { AppShell } from "./components/layout/AppShell";
import QuotingTool, { type QuoteRow } from "@/components/tools/quoting-tool";

// Placeholder root page so `npm run build` works standalone. V0 generations
// replace this file per demo with a client-specific home page (KPIs +
// recent activity) styled after `templates/app/page.tsx`. The shell stays
// intact, including the sliding chat rail and fake user avatar.
//
// While the tools framework is in active development, this placeholder
// renders the QuotingTool with mock data so the page is browseable in
// `npm run dev` for visual review.

const SEED_QUOTES: QuoteRow[] = [
  { id: "q1", client: "Aerospace Dynamics", quoteId: "QT-2026-0891", project: "Titanium turbine housing", amount: 14528, margin: 28.4, confidence: 84, status: "Draft" },
  { id: "q2", client: "Precision Medical", quoteId: "QT-2026-0887", project: "Surgical-grade implant pins", amount: 8400, margin: 22.1, confidence: 91, status: "Review" },
  { id: "q3", client: "Global Robotics", quoteId: "QT-2026-0882", project: "Custom actuator assembly", amount: 31000, margin: 31.5, confidence: 78, status: "Sent" },
  { id: "q4", client: "Northvane Aero", quoteId: "QT-2026-0876", project: "Titanium bracket assembly", amount: 42800, margin: 26.8, confidence: 88, status: "Won" },
  { id: "q5", client: "Trident Metalworks", quoteId: "QT-2026-0871", project: "Turbine blade root fittings", amount: 67200, margin: 34.2, confidence: 92, status: "Won" },
  { id: "q6", client: "Automotive Core", quoteId: "QT-2026-0865", project: "Engine block prototype", amount: 8900, margin: 18.4, confidence: 65, status: "Lost" },
  { id: "q7", client: "Skyline Defense", quoteId: "QT-2026-0858", project: "Composite radar housing", amount: 21400, margin: 12.6, confidence: 58, status: "Expired" },
];

export default function HomePage() {
  return (
    <AppShell brandName="Rosedale">
      <QuotingTool
        title="Quoting"
        subtitle="AI-assisted quote drafting and pipeline tracking"
        kpis={[
          { label: "Win rate", value: "64.2%", delta: { direction: "up", amount: "3.1 MoM" }, sub: "Trailing 90 days" },
          { label: "Avg turnaround", value: "2.4h", delta: { direction: "down", amount: "0.6h faster" } },
          { label: "Pipeline value", value: "$1.8M", sub: "12 open quotes" },
          { label: "Avg margin", value: "27.3%", delta: { direction: "up", amount: "1.4 pts" } },
        ]}
        quotes={SEED_QUOTES}
        aiBannerHeadline="3 quotes are priced 8% below similar won jobs"
        aiBannerBody="Raising margins on QT-2026-0887, 0891, 0882 to match recent wins could add ~$11K to pipeline value."
        aiBannerActionLabel="Apply suggestion"
      />
    </AppShell>
  );
}
