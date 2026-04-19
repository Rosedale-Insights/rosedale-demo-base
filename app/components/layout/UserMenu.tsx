"use client";

import { useEffect, useRef, useState } from "react";
import { SignOut } from "@phosphor-icons/react";

interface UserMenuProps {
  name: string;
  email: string;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Fake user menu for demos — NO real auth, NO real sign-out. Click the
// avatar to open a small popover with the name/email and a Sign-out
// item that does nothing. Gives demos the anchored "real internal tool"
// feel without any live wiring.
export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-outside dismiss — manual instead of Radix so the shell has
  // zero new runtime deps.
  useEffect(() => {
    if (!open) return;
    function handlePointer(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label={`Account menu for ${name}`}
        aria-expanded={open}
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/10 text-white text-[10px] font-medium ring-1 ring-white/10">
          {initialsFrom(name)}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] min-w-[220px] rounded-lg border border-border bg-white shadow-lg z-50 py-1 text-[13px] text-foreground"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>
          <div className="h-px bg-border mx-1" />
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted text-[13px]"
            onClick={() => setOpen(false)}
          >
            <SignOut weight="regular" size={14} className="text-muted-foreground" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
