"use client";

import { ChevronDown, ChevronUp, ClipboardPaste, FileText } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MeetingSource } from "@/features/meetings/types";

export function OriginalNotesPanel({ sources }: { sources: MeetingSource[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-section">Original Meeting Notes</CardTitle>
        <CardDescription>
          Sources remain separate, unchanged, and available throughout Human Review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sources.map((source, index) => {
          const isCollapsed = collapsed.has(source.id);
          const regionId = `meeting-source-${source.id}`;
          return (
            <section key={source.id} className="overflow-hidden rounded-lg border border-border">
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
                {source.source_type === "file" ? (
                  <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <ClipboardPaste className="size-4 shrink-0 text-primary" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {source.original_file_name ?? "Pasted meeting notes"}
                  </p>
                  <p className="text-caption text-muted-foreground">Source {index + 1}</p>
                </div>
                <Badge variant="outline">
                  {source.source_type === "file" ? "File" : "Pasted text"}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-expanded={!isCollapsed}
                  aria-controls={regionId}
                  onClick={() =>
                    setCollapsed((current) => {
                      const next = new Set(current);
                      if (next.has(source.id)) next.delete(source.id);
                      else next.add(source.id);
                      return next;
                    })
                  }
                >
                  {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                  {isCollapsed ? "Expand notes" : "Collapse notes"}
                </Button>
              </div>
              {!isCollapsed ? (
                <div id={regionId} role="region" aria-label={`Source ${index + 1} content`}>
                  <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-sans text-sm leading-6 text-foreground">
                    {source.raw_text}
                  </pre>
                </div>
              ) : null}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
