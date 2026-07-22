"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appConfig } from "@/config/app";
import { workspaceNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { NavigationIcon } from "./navigation-icon";

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[var(--sidebar-width)] shrink-0 border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="flex h-[var(--header-height)] items-center border-b border-border px-5">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${appConfig.name} dashboard`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {appConfig.shortName}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {appConfig.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Meeting follow-up
            </span>
          </span>
        </Link>
      </div>

      <nav
        aria-label="Workspace navigation"
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <p className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
          Workspace
        </p>

        <ul className="space-y-1">
          {workspaceNavigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <NavigationIcon
                    name={item.icon}
                    className={cn(
                      "size-[1.125rem] shrink-0",
                      active
                        ? "text-primary"
                        : "text-subtle-foreground group-hover:text-foreground",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-muted px-3.5 py-3">
          <p className="text-xs font-semibold text-foreground">
            Human-reviewed workflow
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            AI output remains a draft until you approve and publish it.
          </p>
        </div>
      </div>
    </aside>
  );
}
