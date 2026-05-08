import { AppShell } from "../components/layout/AppShell";
import VigilantController, {
  type Finding,
} from "@/components/tools/vigilant-controller";

const FINDINGS: Finding[] = [
  {
    id: "f1",
    title: "Duplicate freight invoice — Vendor A / PO-4821",
    severity: "Critical",
    dollarImpact: 18400,
    type: "Invoice Duplicate",
    detectedAt: "2026-05-06",
    status: "New",
    aiSummary:
      "Two invoices (INV-9923 and INV-9941) reference the same PO and shipment date. Line items, quantities, and weights are identical. The second invoice was submitted 3 days after the first cleared AP. This pattern matches 4 prior confirmed duplicates from Vendor A in the last 12 months.",
    evidence: [
      { label: "Vendor", value: "Vendor A — Atlas Freight LLC" },
      { label: "Invoice 1", value: "INV-9923 ($18,400)" },
      { label: "Invoice 2", value: "INV-9941 ($18,400)" },
      { label: "PO", value: "PO-4821" },
      { label: "Ship Date", value: "Apr 28, 2026" },
      { label: "Discrepancy", value: "$18,400 (100% duplicate)" },
    ],
  },
  {
    id: "f2",
    title: "Rate escalation without contract amendment — Carrier B",
    severity: "High",
    dollarImpact: 7200,
    type: "Freight Overcharge",
    detectedAt: "2026-05-05",
    status: "Under Review",
    aiSummary:
      "Carrier B increased the per-mile rate from $3.42 to $3.78 starting April 15 without a corresponding contract amendment. The original rate is locked through Q3 2026 per agreement MSA-2024-071. Total overage across 6 shipments is $7,200.",
    evidence: [
      { label: "Carrier", value: "Carrier B — Northline Logistics" },
      { label: "Contract Rate", value: "$3.42/mile" },
      { label: "Billed Rate", value: "$3.78/mile" },
      { label: "Affected Shipments", value: "6 (Apr 15 – May 3)" },
      { label: "Contract Ref", value: "MSA-2024-071" },
      { label: "Overage", value: "$7,200" },
    ],
  },
  {
    id: "f3",
    title: "Vendor C overbilled on unit price — Part #TBH-440",
    severity: "High",
    dollarImpact: 4800,
    type: "Vendor Overcharge",
    detectedAt: "2026-05-04",
    status: "New",
    aiSummary:
      "PO-5102 specifies $24.00/unit for Part #TBH-440 (qty 400). Vendor C invoiced at $36.00/unit. The contracted unit price has not changed since the last order in February. This is the second overcharge from this vendor in 90 days.",
    evidence: [
      { label: "Vendor", value: "Vendor C — Precision Parts Co" },
      { label: "PO", value: "PO-5102" },
      { label: "Contracted Price", value: "$24.00/unit" },
      { label: "Billed Price", value: "$36.00/unit" },
      { label: "Quantity", value: "400 units" },
      { label: "Overage", value: "$4,800" },
    ],
  },
  {
    id: "f4",
    title: "Non-compliant payment terms — Supplier D",
    severity: "Medium",
    dollarImpact: 3200,
    type: "Contract Non-compliance",
    detectedAt: "2026-05-02",
    status: "Confirmed",
    aiSummary:
      "Supplier D's latest invoice requests Net 15 payment terms, but the master agreement stipulates Net 45. Early payment would forgo $3,200 in float benefit. This has occurred on 3 of the last 5 invoices from this supplier.",
    evidence: [
      { label: "Supplier", value: "Supplier D — Alloy Components" },
      { label: "Invoice", value: "INV-2026-0884" },
      { label: "Stated Terms", value: "Net 15" },
      { label: "Contract Terms", value: "Net 45" },
      { label: "Invoice Amount", value: "$86,400" },
      { label: "Float at Risk", value: "$3,200" },
    ],
  },
  {
    id: "f5",
    title: "Fuel surcharge above index cap — Carrier E",
    severity: "Medium",
    dollarImpact: 2100,
    type: "Freight Overcharge",
    detectedAt: "2026-04-29",
    status: "Dismissed",
    aiSummary:
      "Carrier E applied an 18.5% fuel surcharge on 4 recent invoices. The DOE index for the billing period supports a maximum surcharge of 14.2% per the contract formula. Excess surcharge totals $2,100.",
    evidence: [
      { label: "Carrier", value: "Carrier E — Summit Transport" },
      { label: "Applied Surcharge", value: "18.5%" },
      { label: "Max per Index", value: "14.2%" },
      { label: "Invoices Affected", value: "4" },
      { label: "Overage", value: "$2,100" },
    ],
  },
  {
    id: "f6",
    title: "Possible duplicate PO — Vendor F / Part #CRX-210",
    severity: "Low",
    dollarImpact: 1400,
    type: "Invoice Duplicate",
    detectedAt: "2026-04-25",
    status: "Resolved",
    aiSummary:
      "PO-5044 and PO-5046 both order 50 units of Part #CRX-210 from the same vendor within 2 days. The descriptions and delivery addresses match. This may be intentional (separate departments) but matches the duplicate-PO pattern.",
    evidence: [
      { label: "Vendor", value: "Vendor F — MidWest Supply" },
      { label: "PO 1", value: "PO-5044 (50 units, $1,400)" },
      { label: "PO 2", value: "PO-5046 (50 units, $1,400)" },
      { label: "Part", value: "CRX-210" },
      { label: "Similarity", value: "99% match" },
    ],
  },
  {
    id: "f7",
    title: "Weight discrepancy on LTL shipment — Carrier A",
    severity: "Medium",
    dollarImpact: 960,
    type: "Freight Overcharge",
    detectedAt: "2026-04-22",
    status: "New",
    aiSummary:
      "BOL lists 2,400 lbs but the carrier billed for 3,100 lbs. Warehouse scale records confirm the actual weight was 2,380 lbs. The 30% weight inflation results in a $960 overcharge on this single shipment.",
    evidence: [
      { label: "Carrier", value: "Carrier A — Atlas Freight LLC" },
      { label: "BOL Weight", value: "2,400 lbs" },
      { label: "Billed Weight", value: "3,100 lbs" },
      { label: "Actual Weight", value: "2,380 lbs" },
      { label: "Shipment", value: "SHP-2026-0341" },
      { label: "Overage", value: "$960" },
    ],
  },
  {
    id: "f8",
    title: "Accessorial charge not in contract — Carrier B",
    severity: "Low",
    dollarImpact: 450,
    type: "Contract Non-compliance",
    detectedAt: "2026-04-18",
    status: "Under Review",
    aiSummary:
      "Carrier B added a $450 'congestion surcharge' line item not present in the contracted rate schedule. No amendment or prior notification was provided. The charge appeared on one invoice covering a metro delivery.",
    evidence: [
      { label: "Carrier", value: "Carrier B — Northline Logistics" },
      { label: "Charge", value: "Congestion surcharge — $450" },
      { label: "Invoice", value: "INV-NL-88412" },
      { label: "Contract Ref", value: "MSA-2024-071" },
    ],
  },
];

export default function VigilantPage() {
  return (
    <AppShell brandName="Rosedale">
      <VigilantController
        title="Vigilant Controller"
        subtitle="AI-powered financial anomaly detection"
        kpis={[
          {
            label: "Savings identified",
            value: "$232K",
            delta: { direction: "up", amount: "12% YTD" },
            sub: "YTD realized + open",
          },
          {
            label: "Findings resolved",
            value: "34",
            delta: { direction: "up", amount: "+8 this month" },
          },
          {
            label: "Pending review",
            value: "6",
            sub: "across 4 vendors",
          },
          {
            label: "Avg resolve time",
            value: "1.8d",
            delta: { direction: "down", amount: "0.4d faster" },
          },
        ]}
        findings={FINDINGS}
        savings={{
          ytdRealized: 184200,
          identified: 47800,
          breakdown: [
            { label: "Freight Overcharges", amount: 64200 },
            { label: "Duplicate Invoices", amount: 52400 },
            { label: "Vendor Overcharges", amount: 41100 },
            { label: "Contract Non-compliance", amount: 26500 },
          ],
        }}
      />
    </AppShell>
  );
}
