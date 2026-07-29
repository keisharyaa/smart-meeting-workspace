import { Loader2, PencilLine, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProcessingMethodSelector({
  selected,
  processing,
  onAi,
  onManual,
}: {
  selected: "ai" | "manual" | null;
  processing: boolean;
  onAi: () => void;
  onManual: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-section">Processing Method</CardTitle>
        <CardDescription>
          Both methods create unofficial, editable draft content.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className={cn("rounded-lg border border-border p-4", selected === "ai" && "border-primary bg-secondary/40")}>
          <div className="flex items-start justify-between gap-3">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            {selected === "ai" ? <Badge>Selected</Badge> : null}
          </div>
          <h3 className="heading-card mt-3">Process with AI</h3>
          <p className="text-helper mt-1">
            Generate an editable draft from the Original Meeting Notes.
          </p>
          <Button type="button" className="mt-4 w-full sm:w-auto" onClick={onAi} disabled={processing}>
            {processing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {processing ? "Processing meeting notes..." : selected === "ai" ? "Retry Extraction" : "Process with AI"}
          </Button>
        </div>
        <div className={cn("rounded-lg border border-border p-4", selected === "manual" && "border-primary bg-secondary/40")}>
          <div className="flex items-start justify-between gap-3">
            <PencilLine className="size-5 text-primary" aria-hidden="true" />
            {selected === "manual" ? <Badge variant="secondary">Selected</Badge> : null}
          </div>
          <h3 className="heading-card mt-3">Continue Manually</h3>
          <p className="text-helper mt-1">
            Start with empty review sections or continue editing the current draft.
          </p>
          <Button type="button" variant="secondary" className="mt-4 w-full sm:w-auto" onClick={onManual} disabled={processing}>
            <PencilLine />
            Continue Manually
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
