"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NavItem } from "./NavItem";
import {
  primaryNav,
  footerNav,
  isNavGroup,
  type NavGroup,
  type NavLeaf,
} from "./nav-config";

interface SidebarProps {
  onNavigate?: () => void;
}

// Sidebar surface + spacing come from the --surface-sidebar token in
// globals.css. Do not hard-code background colors here — use the token so
// per-tenant theming flows through CSS var overrides.
export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname() ?? "";

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const isOpen = (id: string) => !collapsed.has(id);
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const groupActive = (group: NavGroup) =>
    group.children.some((child) => isActive(child.href));

  return (
    <div className="flex flex-col h-full bg-surface-sidebar text-foreground pt-4">
      <nav className="flex-1 overflow-y-auto px-2.5">
        <ul className="space-y-px">
          {primaryNav.map((item) => {
            if (isNavGroup(item)) {
              const open = isOpen(item.id);
              return (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={groupActive(item)}
                  expandable
                  expanded={open}
                  onClick={() => toggle(item.id)}
                >
                  {open && (
                    <ul className="space-y-px">
                      {item.children.map((child: NavLeaf) => (
                        <NavItem
                          key={child.href}
                          href={child.href}
                          icon={child.icon}
                          label={child.label}
                          active={isActive(child.href)}
                          sub
                          onClick={onNavigate}
                        />
                      ))}
                    </ul>
                  )}
                </NavItem>
              );
            }

            return (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href)}
                onClick={onNavigate}
              />
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-black/6 px-2.5 py-2">
        <ul className="space-y-px">
          {footerNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
              onClick={onNavigate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
