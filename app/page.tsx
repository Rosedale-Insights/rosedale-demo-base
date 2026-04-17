import { AppShell } from "./components/layout/AppShell";

// Placeholder root page so `npm run build` works standalone. V0 generations
// replace this file per demo with a client-specific home page (KPIs + recent
// activity) styled after `templates/app/page.tsx`. The shell stays intact.
export default function HomePage() {
  return (
    <AppShell>
      <div className="pt-2">
        <h1 className="text-2xl">Rosedale OS</h1>
        <p className="text-sm text-muted-foreground mt-2">
          This is the demo-base template. When V0 generates a real demo, it
          replaces this page with client-specific KPIs and recent activity.
          Reference: <code>templates/app/page.tsx</code>.
        </p>
      </div>
    </AppShell>
  );
}
