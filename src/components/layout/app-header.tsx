import Link from "next/link";

import { appConfig } from "@/config/app";

import { MobileNavigation } from "./mobile-navigation";

/**
 * Shared workspace header.
 *
 * Authentication data and unread reminder totals will be connected
 * by their feature owners. This component currently provides a
 * consistent, build-safe visual contract.
 */
interface AppHeaderProps {
  fullName?: string;
  unreadReminderCount?: number;
}

export function AppHeader({ fullName, unreadReminderCount = 0 }: AppHeaderProps) {
  const trimmedName = fullName?.trim();
  const displayName = trimmedName || "Workspace Owner";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "WO";

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-border bg-card/95 px-[var(--page-padding-x)] backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {appConfig.name}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {appConfig.supportLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/reminders"
          aria-label="Open reminders"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-[1.125rem]"
          >
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          {unreadReminderCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-semibold leading-5 text-destructive-foreground">
              {unreadReminderCount > 9 ? "9+" : unreadReminderCount}
            </span>
          ) : null}
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials}
          </span>
          <span className="hidden text-left md:block">
            <span className="block text-xs font-semibold text-foreground">
              {displayName}
            </span>
            <span className="block text-[0.6875rem] text-muted-foreground">
              Account settings
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
