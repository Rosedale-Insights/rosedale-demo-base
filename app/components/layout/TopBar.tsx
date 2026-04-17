"use client";

import { List as ListIcon } from "@phosphor-icons/react";

interface TopBarProps {
  onMenuToggle: () => void;
  // Brand name shown in the top-left wordmark. V0 replaces per demo.
  brandName?: string;
}

// 48px black bar with wordmark on the left. Real deployments may swap the
// wordmark for a client logo — do not reintroduce auth/user menu here.
export function TopBar({ onMenuToggle, brandName = "Rosedale" }: TopBarProps) {
  return (
    <div className="flex items-center w-full h-12 shrink-0 px-4 bg-[#1a1a1a]">
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="app-shell-menu-btn p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <ListIcon weight="light" className="size-5" />
        </button>
        <span className="hidden app-shell-logo items-center text-white/90 text-sm font-semibold tracking-tight">
          {brandName}
        </span>
      </div>

      <div className="flex-1" />
    </div>
  );
}
