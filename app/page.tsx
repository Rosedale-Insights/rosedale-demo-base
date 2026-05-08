import Link from "next/link";
import { AppShell } from "./components/layout/AppShell";
import { Receipt, Wrench, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const tools = [
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

export default function HomePage() {
  return (
    <AppShell brandName="Rosedale">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl mb-1">Welcome back</h1>
        <p className="text-muted-foreground mb-8">
          Rosedale OS — your tools at a glance.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <tool.icon className="size-5 text-primary" weight="duotone" />
                <h2 className="font-semibold text-sm">{tool.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {tool.description}
              </p>
              <div className="flex gap-4">
                {tool.stats.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
