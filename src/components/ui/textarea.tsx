import {
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
      "placeholder:text-muted-foreground",
      "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
      "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
