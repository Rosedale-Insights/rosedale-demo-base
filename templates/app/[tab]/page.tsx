// TEMPLATE — reference only. V0 reads this to learn the Rosedale content-page
// anatomy (header with section title + meta, card grid, right-aligned actions),
// then creates one file per tab in the client's input.tabs list. Output goes to
// `app/[actual-tab]/page.tsx`. This file stays under `templates/` so Next.js
// routing never sees it.

import { AppShell } from "@/app/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RowProps {
  title: string;
  subtitle: string;
  status: "Open" | "In progress" | "Done";
}

function Row({ title, subtitle, status }: RowProps) {
  const chipClass =
    status === "Done"
      ? "bg-emerald-50 text-emerald-700"
      : status === "In progress"
        ? "bg-amber-50 text-amber-700"
        : "bg-muted text-muted-foreground";

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">
          {subtitle}
        </div>
      </div>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${chipClass}`}>
        {status}
      </span>
    </div>
  );
}

export default function TemplateTabPage() {
  return (
    <AppShell>
      <div className="pt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">Tab title</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Short, industry-specific description of what this tab shows.
          </p>
        </div>
        <Button size="sm">New item</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mt-6">
        <div className="text-sm font-semibold">Recent</div>
        <Separator className="mt-3" />
        <Row title="Sample item one" subtitle="Short descriptor here" status="In progress" />
        <Separator />
        <Row title="Sample item two" subtitle="Short descriptor here" status="Open" />
        <Separator />
        <Row title="Sample item three" subtitle="Short descriptor here" status="Done" />
      </div>
    </AppShell>
  );
}
