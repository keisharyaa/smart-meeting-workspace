import type { ReactNode } from "react";

import { appConfig } from "@/config/app";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Shared authentication layout.
 *
 * Authentication business logic remains inside the auth feature.
 */
export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="hidden border-r border-border bg-card px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {appConfig.shortName}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {appConfig.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {appConfig.supportLabel}
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Clear outcomes after every meeting
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.035em] text-foreground">
            Turn meeting notes into reviewed, accountable work.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Structure decisions, blockers, unresolved questions,
            and action items in one calm workspace while keeping
            every AI-generated result under human review.
          </p>

          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
            {[
              "Capture",
              "Review",
              "Track",
            ].map((label, index) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-background px-4 py-3"
              >
                <p className="text-xs font-semibold text-primary">
                  0{index + 1}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Built for structured post-meeting follow-up.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
              {appConfig.shortName}
            </span>
            <div>
              <p className="text-sm font-semibold">{appConfig.name}</p>
              <p className="text-xs text-muted-foreground">
                {appConfig.supportLabel}
              </p>
            </div>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
