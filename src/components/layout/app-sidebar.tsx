import Link from "next/link";

/**
 * Shared workspace sidebar.
 *
 * TODO:
 * 1. Read navigation items from a shared navigation config.
 * 2. Highlight the currently active route.
 * 3. Include Dashboard, Projects, Meetings, Action Items,
 *    Reminders, People, and Settings.
 * 4. Keep the sidebar usable on laptop and tablet widths.
 * 5. Add a collapsed or drawer behavior for smaller widths.
 * 6. Do not fetch feature data directly in this component.
 */

const navigationItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Meetings", href: "/meetings" },
  { label: "Action Items", href: "/action-items" },
  { label: "Reminders", href: "/reminders" },
  { label: "People", href: "/people" },
  { label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  return (
    <nav aria-label="Workspace navigation">
      <ul>
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}