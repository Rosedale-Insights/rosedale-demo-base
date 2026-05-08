import { House, Receipt, Wrench, ShieldCheck, GearSix, type Icon } from "@phosphor-icons/react";

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
export const primaryNav: NavNode[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/quoting", label: "Quoting", icon: Receipt },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/vigilant", label: "Vigilant", icon: ShieldCheck },
];

export const footerNav: NavLeaf[] = [
  { href: "/settings", label: "Settings", icon: GearSix },
];
