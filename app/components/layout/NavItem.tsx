"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRight, type Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href?: string;
  icon?: Icon;
  label: string;
  active: boolean;
  onClick?: () => void;
  sub?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  children?: ReactNode;
}

// Rosedale OS nav row anatomy (DO NOT drift):
// - 13px text, 34px row height
// - 17px phosphor icon at weight="light"
// - Active: white bg, 1px bottom shadow, font-semibold
// - Hover: bg-black/5
// Every generated demo must preserve these exact specs.
export function NavItem({
  href,
  icon: IconComponent,
  label,
  active,
  onClick,
  sub,
  expandable,
  expanded,
  children,
}: NavItemProps) {
  const classes = cn(
    "flex items-center gap-2 w-full rounded-lg text-left truncate transition-colors",
    sub ? "px-2 py-1 pl-7 text-[13px]" : "px-2 py-1.5 text-[13px]",
    active
      ? "bg-white text-[#1a1a1a] font-semibold shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"
      : "font-medium text-[#303030] hover:bg-black/5 hover:text-[#1a1a1a]",
  );

  const inner = (
    <>
      {IconComponent && (
        <span className="shrink-0 size-5 flex items-center justify-center [&>svg]:size-[17px]">
          <IconComponent weight="light" />
        </span>
      )}
      <span className="truncate">{label}</span>
      {expandable && (
        <CaretRight
          weight="light"
          className={cn(
            "size-3.5 ml-auto shrink-0 transition-transform",
            expanded && "rotate-90",
          )}
        />
      )}
    </>
  );

  return (
    <li className="list-none my-0.5">
      {href && !expandable ? (
        <Link
          href={href}
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          className={classes}
        >
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-current={active && !expandable ? "page" : undefined}
          aria-expanded={expandable ? expanded : undefined}
          className={classes}
        >
          {inner}
        </button>
      )}
      {children}
    </li>
  );
}
