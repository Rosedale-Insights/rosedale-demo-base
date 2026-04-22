"use client";

import { useState, type ReactNode } from "react";
import { ShellChatPanel } from "../../components/chat/ShellChatPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
  brandName?: string;
  // Optional favicon/logo URL. Rendered in the TopBar immediately
  // before the wordmark. Source of truth resolves on the Rosedale side
  // (favicon extracted from the prospect's website URL) and flows
  // through as a Vercel Blob URL.
  logoUrl?: string;
  // Fake account shown in the top-right user menu. V0 can provide a
  // believable name + email per demo — demos have no real auth.
  fakeUserName?: string;
  fakeUserEmail?: string;
  // Optional per-demo starter questions passed into the shell chat
  // panel. V0 sources these from the AI Opportunities list (the
  // discovery enrichment's primary content field). Generic fallback
  // inside the panel when not provided.
  chatStarterQuestions?: string[];
}

// Canonical Rosedale OS shell. 220px fixed sidebar, rounded-top main
// panel, bg-[#1a1a1a] outer frame. Right rail slides out when the chat
// toggle in TopBar fires. Per-tenant theming flows through
// --surface-sidebar / --primary CSS vars in globals.css.
export function AppShell({
  children,
  brandName,
  logoUrl,
  fakeUserName,
  fakeUserEmail,
  chatStarterQuestions,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Grid track strategy.
  //
  // Both `<main>` and the chat container stay mounted in the DOM so
  // React state (scroll position, chat draft input) survives toggling.
  // Visibility is controlled purely by grid track widths. The two items
  // sit in DOM order: col 1 = main, col 2 = chat.
  //
  //   Mobile (< sidebarBreakpoint):
  //     chat closed  → `1fr 0px`  — main full, chat hidden
  //     chat open    → `0px 1fr`  — chat takes over full viewport,
  //                                 main collapses. Closes via TopBar
  //                                 toggle. Sidebar stays drawer-only
  //                                 because sidebarBreakpoint bumps to
  //                                 1024 whenever chat is open.
  //
  //   Desktop (≥ sidebarBreakpoint):
  //     always sidebar (220) + main (1fr) + chat (440px or 0px).
  //     Main compresses to make room; both coexist at lg+.
  const sidebarBreakpoint = chatOpen ? 1024 : 768;
  const mainCol = "minmax(0, 1fr)";
  const chatCol = chatOpen ? "440px" : "0px";
  const mobileColumns = chatOpen ? `0px ${mainCol}` : `${mainCol} 0px`;
  const desktopColumns = `220px ${mainCol} ${chatCol}`;

  return (
    <div className="h-screen overflow-hidden overscroll-none flex flex-col bg-[#1a1a1a]">
      <TopBar
        onMenuToggle={() => setMobileMenuOpen((v) => !v)}
        onChatToggle={() => setChatOpen((v) => !v)}
        isChatOpen={chatOpen}
        brandName={brandName}
        logoUrl={logoUrl}
        fakeUserName={fakeUserName}
        fakeUserEmail={fakeUserEmail}
      />

      <div
        className="app-shell-grid flex-1 min-h-0 grid transition-[grid-template-columns] duration-200 ease-in-out"
        style={{ gridTemplateColumns: mobileColumns }}
      >
        <style>{`
          @media (min-width: ${sidebarBreakpoint}px) {
            .app-shell-grid {
              grid-template-columns: ${desktopColumns} !important;
            }
            .app-shell-sidebar { display: flex !important; }
            .app-shell-main { border-radius: 0 12px 0 0 !important; }
            .app-shell-mobile-overlay { display: none !important; }
            .app-shell-menu-btn { display: none !important; }
            .app-shell-logo { display: inline-flex !important; }
          }
        `}</style>

        <aside
          className="hidden flex-col overflow-hidden app-shell-sidebar"
          style={{ borderRadius: "12px 0 0 0" }}
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
          <div className="max-w-[96rem] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 pb-6 min-h-full">
            {children}
          </div>
        </main>

        {/* Right-rail chat. Always in the DOM so React state (scroll,
            draft input) survives toggling; visibility is controlled by
            the grid track width above plus an opacity fade.
            Mobile (< lg): chat takes over full viewport width when open,
            mirrors main's rounded-top-both-corners look, no left seam.
            Desktop (lg+): sits as 440px rail right of main with a 6px
            seam (ml-1.5) and only top-left corner rounded to meet main's
            right edge. */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden bg-white transition-opacity duration-200 ease-in-out ml-0 lg:ml-1.5 rounded-t-xl lg:rounded-tr-none ${
            chatOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!chatOpen}
          inert={!chatOpen || undefined}
        >
          <ShellChatPanel
            brandName={brandName ?? "Rosedale"}
            starterQuestions={chatStarterQuestions}
          />
        </div>
      </div>
    </div>
  );
}
