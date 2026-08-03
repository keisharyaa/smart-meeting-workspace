import Link from "next/link";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUserPeopleDirectory } from "@/features/people/queries";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const { people, error } = await getCurrentUserPeopleDirectory();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="People"
        title="People Directory"
        description="PIC contacts generated from published official action items."
      />

      {error ? (
        <ErrorState
          title="People Directory is unavailable"
          message={error}
          action={
            <Link href="/people" className={buttonVariants({ variant: "outline" })}>
              Retry
            </Link>
          }
        />
      ) : people.length === 0 ? (
        <EmptyState
          title="No published PIC records yet"
          description="People will appear here after a Human Review is approved and published with official action items that have a PIC."
          icon={<Users className="size-5" aria-hidden="true" />}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <Card key={person.key} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="heading-card truncate">
                      {person.fullName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {person.role ?? "Role Not Mentioned"}
                    </CardDescription>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                    {getInitials(person.fullName)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-5">
                <dl className="space-y-3 text-sm">
                  <Info label="Email" value={person.email ?? "Not Mentioned"} />
                  <Info
                    label="Related projects"
                    value={`${person.relatedProjects.length}`}
                  />
                  <Info
                    label="Published meetings"
                    value={`${person.relatedPublishedMeetings.length}`}
                  />
                </dl>

                <div className="grid grid-cols-2 gap-3">
                  <CountBadge
                    label="Open"
                    value={person.openActionItemCount}
                    variant="warning"
                  />
                  <CountBadge
                    label="Completed"
                    value={person.completedActionItemCount}
                    variant="success"
                  />
                </div>

                <Link
                  href={`/people/${person.key}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  View PIC detail
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-body text-foreground">{value}</dd>
    </div>
  );
}

function CountBadge({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "success" | "warning";
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-caption text-muted-foreground">{label}</p>
      <Badge variant={variant} className="mt-2">
        {value} item{value === 1 ? "" : "s"}
      </Badge>
    </div>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "PIC";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

