export type NavigationIcon =
  | "dashboard"
  | "projects"
  | "meetings"
  | "actions"
  | "reminders"
  | "people"
  | "settings";

export interface NavigationItem {
  label: string;
  href: string;
  icon: NavigationIcon;
  description: string;
}

export const workspaceNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    description: "Workspace overview",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: "projects",
    description: "Organize meeting work",
  },
  {
    label: "Meetings",
    href: "/meetings",
    icon: "meetings",
    description: "Review meeting records",
  },
  {
    label: "Action Items",
    href: "/action-items",
    icon: "actions",
    description: "Track follow-up work",
  },
  {
    label: "Reminders",
    href: "/reminders",
    icon: "reminders",
    description: "Watch upcoming deadlines",
  },
  {
    label: "People",
    href: "/people",
    icon: "people",
    description: "Manage reusable PICs",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
    description: "Account preferences",
  },
];
