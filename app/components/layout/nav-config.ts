import { House, ChartBar, Users, Folder, GearSix, type Icon } from "@phosphor-icons/react";

export interface NavLeaf {
  href: string;
  label: string;
  icon: Icon;
}

export interface NavGroup {
  kind: "group";
  id: string;
  label: string;
  icon: Icon;
  children: NavLeaf[];
}

export type NavNode = NavLeaf | NavGroup;

export function isNavGroup(node: NavNode): node is NavGroup {
  return (node as NavGroup).kind === "group";
}

// V0 replaces this array per demo with the client's actual tabs.
// Generic entries shown here are illustrative — they exist so the shell
// renders a populated sidebar when the base is opened in isolation.
export const primaryNav: NavNode[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/analytics", label: "Analytics", icon: ChartBar },
  { href: "/users", label: "Users", icon: Users },
  { href: "/projects", label: "Projects", icon: Folder },
];

export const footerNav: NavLeaf[] = [
  { href: "/settings", label: "Settings", icon: GearSix },
];
