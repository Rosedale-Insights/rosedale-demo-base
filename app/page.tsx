import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppShell } from "./components/layout/AppShell";
import { toolCards } from "./components/layout/tool-cards-config";

export default function HomePage() {
  return (
    <AppShell brandName="Rosedale">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl mb-1">Welcome back</h1>
        <p className="text-muted-foreground mb-8">
          Rosedale OS — your tools at a glance.
        </p>

        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2",
            toolCards.length >= 3 && "lg:grid-cols-3"
          )}
        >
          {toolCards.map((tool) => (
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
                    <div className="text-sm font-semibold truncate">
                      {s.value}
                    </div>
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
