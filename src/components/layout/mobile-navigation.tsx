"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { appConfig } from "@/config/app";
import { workspaceNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { NavigationIcon } from "./navigation-icon";

export function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open workspace navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          className="size-5"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close workspace navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/25"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-card shadow-[var(--shadow-overlay)]">
            <div className="flex h-[var(--header-height)] items-center justify-between border-b border-border px-4">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {appConfig.shortName}
                </span>
                <span className="truncate text-sm font-semibold">
                  {appConfig.name}
                </span>
              </Link>

              <button
                type="button"
                aria-label="Close workspace navigation"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav
              aria-label="Mobile workspace navigation"
              className="flex-1 overflow-y-auto p-3"
            >
              <ul className="space-y-1">
                {workspaceNavigation.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                          active
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <NavigationIcon
                          name={item.icon}
                          className="size-[1.125rem]"
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
