import type { Icon } from "@phosphor-icons/react";
import { Receipt, Wrench, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export interface ToolCard {
  href: string;
  icon: Icon;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
}

// V0 replaces this array per demo with the client's actual tool cards.
export const toolCards: ToolCard[] = [
  {
    href: "/quoting",
    icon: Receipt,
    title: "Quoting",
    description: "AI-assisted quote drafting and pipeline tracking",
    stats: [
      { label: "Win rate", value: "64.2%" },
      { label: "Pipeline", value: "$1.8M" },
      { label: "Open quotes", value: "12" },
    ],
  },
  {
    href: "/maintenance",
    icon: Wrench,
    title: "Maintenance Intelligence",
    description: "AI-monitored fleet health and PM scheduling",
    stats: [
      { label: "Uptime", value: "94.2%" },
      { label: "Overdue PMs", value: "1" },
      { label: "Downtime avoided", value: "$48.2K" },
    ],
  },
  {
    href: "/vigilant",
    icon: ShieldCheck,
    title: "Vigilant Controller",
    description: "AI-powered financial anomaly detection",
    stats: [
      { label: "Savings", value: "$232K" },
      { label: "Resolved", value: "34" },
      { label: "Pending", value: "6" },
    ],
  },
];
