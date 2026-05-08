import { AppShell } from "../components/layout/AppShell";
import MaintenanceIntelligence, {
  type MachineCard,
  type PmRow,
} from "@/components/tools/maintenance-intelligence";

// Placeholder route so the maintenance-intelligence tool is browseable in
// `npm run dev` while the tools framework is in active development. V0
// generations replace this file per demo with client-specific mock data.

const MACHINES: MachineCard[] = [
  {
    id: "CNC-04",
    name: "Haas VF-2",
    type: "3-axis mill",
    spindleHours: 412,
    spindleHoursThreshold: 500,
    healthScore: 78,
    vibration: "Attention",
    nextPmDate: "2026-05-12",
    openWorkOrders: 2,
    hoursQueued: 6,
  },
  {
    id: "5AX-01",
    name: "DMG Mori DMU 50",
    type: "5-axis mill",
    spindleHours: 268,
    spindleHoursThreshold: 600,
    healthScore: 92,
    vibration: "Normal",
    nextPmDate: "2026-06-04",
    openWorkOrders: 1,
    hoursQueued: 14,
  },
  {
    id: "CNC-01",
    name: "Mazak VTC-800/30",
    type: "3-axis mill",
    spindleHours: 482,
    spindleHoursThreshold: 500,
    healthScore: 64,
    vibration: "Alarm",
    nextPmDate: "2026-05-09",
    openWorkOrders: 3,
    hoursQueued: 22,
  },
  {
    id: "LAT-01",
    name: "Okuma LB3000",
    type: "Lathe",
    spindleHours: 184,
    spindleHoursThreshold: 400,
    healthScore: 88,
    vibration: "Normal",
    nextPmDate: "2026-06-21",
    openWorkOrders: 0,
    hoursQueued: 4,
  },
  {
    id: "5AX-02",
    name: "Hermle C400",
    type: "5-axis mill",
    spindleHours: 552,
    spindleHoursThreshold: 600,
    healthScore: 71,
    vibration: "Attention",
    nextPmDate: "2026-05-14",
    openWorkOrders: 2,
    hoursQueued: 8,
  },
  {
    id: "CNC-02",
    name: "Haas VF-4SS",
    type: "3-axis mill",
    spindleHours: 318,
    spindleHoursThreshold: 500,
    healthScore: 85,
    vibration: "Normal",
    nextPmDate: "2026-06-02",
    openWorkOrders: 1,
    hoursQueued: 9,
  },
  {
    id: "LAS-01",
    name: "Trumpf TruLaser 3030",
    type: "Laser cutter",
    spindleHours: 96,
    spindleHoursThreshold: 300,
    healthScore: 96,
    vibration: "Normal",
    nextPmDate: "2026-07-08",
    openWorkOrders: 0,
    hoursQueued: 2,
  },
  {
    id: "HT-01",
    name: "Lindberg Blue M",
    type: "Heat treat oven",
    spindleHours: 240,
    spindleHoursThreshold: 350,
    healthScore: 82,
    vibration: "Normal",
    nextPmDate: "2026-06-15",
    openWorkOrders: 1,
    hoursQueued: 5,
  },
];

const PM_SCHEDULE: PmRow[] = [
  {
    machineId: "CNC-01",
    description: "Spindle bearing replacement (overdue)",
    windowStart: "2026-05-04",
    windowEnd: "2026-05-05",
    durationHrs: 12,
    priority: "Critical",
    conflictsCount: 3,
    status: "Overdue",
  },
  {
    machineId: "5AX-02",
    description: "Axis alignment + ball-screw inspection",
    windowStart: "2026-05-06",
    windowEnd: "2026-05-06",
    durationHrs: 8,
    priority: "High",
    conflictsCount: 1,
    status: "In Progress",
  },
  {
    machineId: "CNC-04",
    description: "Coolant flush + filter swap",
    windowStart: "2026-05-12",
    windowEnd: "2026-05-13",
    durationHrs: 8,
    priority: "High",
    conflictsCount: 1,
    status: "Scheduled",
  },
  {
    machineId: "LAT-01",
    description: "Tailstock calibration",
    windowStart: "2026-05-19",
    windowEnd: "2026-05-19",
    durationHrs: 4,
    priority: "Medium",
    conflictsCount: 0,
    status: "Scheduled",
  },
  {
    machineId: "5AX-01",
    description: "Quarterly predictive scan",
    windowStart: "2026-06-04",
    windowEnd: "2026-06-04",
    durationHrs: 4,
    priority: "Low",
    conflictsCount: 0,
    status: "Scheduled",
  },
  {
    machineId: "HT-01",
    description: "Thermocouple recalibration",
    windowStart: "2026-04-28",
    windowEnd: "2026-04-28",
    durationHrs: 4,
    priority: "Medium",
    conflictsCount: 0,
    status: "Completed",
  },
];

export default function MaintenancePage() {
  return (
    <AppShell brandName="Rosedale">
      <MaintenanceIntelligence
        title="Maintenance Intelligence"
        subtitle="AI-monitored fleet health and PM scheduling"
        kpis={[
          {
            label: "Machine uptime",
            value: "94.2%",
            delta: { direction: "up", amount: "1.4 pts" },
            sub: "Trailing 30 days",
          },
          {
            label: "Overdue PMs",
            value: "1",
            sub: "across 8 machines",
          },
          {
            label: "Scheduled this month",
            value: "5",
            delta: { direction: "up", amount: "+2" },
          },
          {
            label: "Downtime avoided",
            value: "$48.2K",
            sub: "YTD",
          },
        ]}
        machines={MACHINES}
        pmSchedule={PM_SCHEDULE}
      />
    </AppShell>
  );
}
