import { notFound } from "next/navigation";
import { FileText, Sparkles, SquarePen } from "lucide-react";

import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUserMeetingDraft } from "@/features/meetings/review-queries";

interface MeetingReviewPageProps {
  params: Promise<{ meetingId: string }>;
}

export default async function MeetingReviewPage({
  params,
}: MeetingReviewPageProps) {
  const { meetingId } = await params;
  const { data, error } = await getCurrentUserMeetingDraft(meetingId);

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} />
      </PageContainer>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Human Review"
        title={data.meeting.title}
        description="The original sources below are preserved and ready for AI-assisted or manual review."
        actions={<Badge variant="secondary">Draft</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Original meeting notes</CardTitle>
            <CardDescription>
              Sources are shown in their stable intake order. They remain unchanged during review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.sources.map((source) => (
              <section
                key={source.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
                  <FileText className="size-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {source.source_type === "file"
                        ? source.original_file_name
                        : "Pasted meeting notes"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Source {source.source_order + 1}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {source.source_type === "file" ? "File" : "Pasted Text"}
                  </Badge>
                </div>
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-sans text-sm leading-6 text-foreground">
                  {source.raw_text}
                </pre>
              </section>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ContextRow label="Date" value={data.meeting.meeting_date} />
              <ContextRow
                label="Time"
                value={data.meeting.meeting_time ?? "Not provided"}
              />
              <ContextRow
                label="Participants"
                value={data.meeting.participants.join(", ")}
              />
              <ContextRow
                label="Sources"
                value={`${data.sources.length}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose a review method</CardTitle>
              <CardDescription>
                Both methods use the same editable Human Review structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" disabled>
                <Sparkles />
                Process with AI
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <SquarePen />
                Continue Manually
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Processing methods belong to the next Human Review implementation slice. Meeting Intake has successfully preserved the source records.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function ContextRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
