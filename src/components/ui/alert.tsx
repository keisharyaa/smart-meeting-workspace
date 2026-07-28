import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "destructive";

const variants: Record<AlertVariant, string> = {
  info: "border-info/20 bg-info-background text-info-foreground",
  success: "border-success/20 bg-success-background text-success-foreground",
  warning: "border-warning/20 bg-warning-background text-warning-foreground",
  destructive:
    "border-destructive/20 bg-destructive-background text-destructive-foreground",
};

export function Alert({
  variant = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  return (
    <div
      className={cn("rounded-lg border p-4 text-sm leading-6", variants[variant], className)}
      {...props}
    />
  );
}
