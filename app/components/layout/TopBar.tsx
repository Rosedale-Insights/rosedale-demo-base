"use client";

import { ChatCircle, List as ListIcon } from "@phosphor-icons/react";
import { UserMenu } from "./UserMenu";

interface TopBarProps {
  onMenuToggle: () => void;
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  // Brand name shown in the top-left wordmark. V0 replaces per demo.
  brandName?: string;
  // Optional favicon/logo URL. Rendered as a 16px square immediately
  // before the wordmark. Decorative — the brandName text carries the
  // semantic label, so alt="" is intentional.
  logoUrl?: string;
  // Fake account displayed in the top-right. V0 can pass a believable
  // first/last name + email per demo — demos have no real auth, so this
  // is pure aesthetic.
  fakeUserName?: string;
  fakeUserEmail?: string;
}

// 48px black bar with wordmark + menu on the left, chat toggle + fake
// user avatar on the right. The user menu is inert; the chat toggle
// slides out a right-rail panel managed by AppShell.
export function TopBar({
  onMenuToggle,
  onChatToggle,
  isChatOpen = false,
  brandName = "Rosedale",
  logoUrl,
  fakeUserName = "Alex Morgan",
  fakeUserEmail = "alex@rosedale.ai",
}: TopBarProps) {
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
        <span className="hidden app-shell-logo items-center gap-2 text-white/90 text-sm font-semibold tracking-tight">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="size-4 rounded-xs object-contain"
            />
          )}
          {brandName}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 shrink-0">
        {onChatToggle && (
          <button
            type="button"
            onClick={onChatToggle}
            aria-label={isChatOpen ? "Close chat" : `Ask ${brandName}`}
            aria-expanded={isChatOpen}
            className={`p-1.5 rounded-lg transition-colors ${
              isChatOpen
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <ChatCircle weight="light" className="size-5" />
          </button>
        )}
        <div className="pl-2 ml-1 border-l border-white/10">
          <UserMenu name={fakeUserName} email={fakeUserEmail} />
        </div>
      </div>
    </div>
  );
}
