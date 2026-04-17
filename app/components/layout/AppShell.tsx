"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
  brandName?: string;
}

// Canonical Rosedale OS shell. 220px fixed sidebar, rounded-12 main panel,
// bg-[#1a1a1a] outer frame. V0 should wrap every page it generates in this.
// Per-tenant theming flows through --surface-sidebar / --primary CSS vars in
// globals.css — do not hard-code theme colors at the component level.
export function AppShell({ children, brandName }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden overscroll-none flex flex-col bg-[#1a1a1a]">
      <TopBar onMenuToggle={() => setMobileMenuOpen((v) => !v)} brandName={brandName} />

      <div
        className="app-shell-grid flex-1 min-h-0 grid"
        style={{ gridTemplateColumns: "1fr" }}
      >
        <style>{`
          @media (min-width: 768px) {
            .app-shell-grid {
              grid-template-columns: 220px 1fr !important;
            }
            .app-shell-sidebar { display: flex !important; }
            .app-shell-main { border-radius: 0 12px 12px 0 !important; }
            .app-shell-mobile-overlay { display: none !important; }
            .app-shell-menu-btn { display: none !important; }
            .app-shell-logo { display: inline-flex !important; }
          }
        `}</style>

        <aside
          className="hidden flex-col overflow-hidden app-shell-sidebar"
          style={{ borderRadius: "12px 0 0 12px" }}
        >
          <Sidebar />
        </aside>

        <div
          className={`app-shell-mobile-overlay fixed inset-0 top-12 z-40 bg-black/50 transition-opacity duration-200 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
        />
        <aside
          className={`app-shell-mobile-overlay fixed top-12 bottom-0 left-0 z-50 w-60 transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
        </aside>

        <main
          id="main-content"
          className="overflow-auto overscroll-none bg-surface-main min-w-0 rounded-xl app-shell-main"
        >
          <div className="max-w-[96rem] mx-auto w-full px-8 pt-5 pb-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
