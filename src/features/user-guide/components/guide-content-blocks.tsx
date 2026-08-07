import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { workflowSteps } from "../content";
import type { ReferenceItem } from "../types";

export function GuideSection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 space-y-4">
      <div>
        <h2 id={`${id}-heading`} className="heading-section text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function WorkflowSteps() {
  return (
    <ol className="space-y-3">
      {workflowSteps.map((step, index) => (
        <li key={step.title} className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">{index + 1}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
            {step.href && step.linkLabel ? <Link href={step.href} className="mt-2 inline-block text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{step.linkLabel}</Link> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ModuleGuide({ purpose, steps, rules, relatedHref, relatedLabel }: { purpose: string; steps: string[]; rules: string[]; relatedHref?: string; relatedLabel?: string }) {
  return (
    <Card>
      <CardContent className="grid gap-6 pt-5 md:grid-cols-2">
        <div>
          <h3 className="heading-card text-foreground">How to use it</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{purpose}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-foreground">
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
        <div>
          <h3 className="heading-card text-foreground">Important rules</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
          {relatedHref && relatedLabel ? <Link href={relatedHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}>{relatedLabel}</Link> : null}
        </div>
      </CardContent>
    </Card>
  );
}

const toneVariant = {
  neutral: "outline",
  info: "info",
  warning: "warning",
  destructive: "destructive",
  success: "success",
} as const;

export function ReferenceGrid({ title, items }: { title: string; items: ReferenceItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-background p-4">
            <Badge variant={toneVariant[item.tone ?? "neutral"]}>{item.label}</Badge>
            <p className="mt-3 text-sm leading-6 text-foreground">{item.meaning}</p>
            {item.detail ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
