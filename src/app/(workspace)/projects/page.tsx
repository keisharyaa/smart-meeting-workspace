import Link from "next/link";

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
import { getCurrentUserProjects } from "@/features/projects/queries";
import type { ProjectStatus } from "@/features/projects/types";

export const dynamic = "force-dynamic";

const projectStatusPresentation: Record<
  ProjectStatus,
  { label: string; variant: "success" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "success" },
  done: { label: "Done", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};

export default async function ProjectsPage() {
  const { projects, error } = await getCurrentUserProjects();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Organize meeting records and follow-up work by project."
        actions={
          <Link
            href="/projects/new"
            className={buttonVariants({
              className: "!text-primary-foreground",
            })}
          >
            New project
          </Link>
        }
      />

      {error ? (
        <ErrorState title="Projects are unavailable" message={error} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Projects help you organize meeting records and action items in one place."
        />
      ) : (
        <section aria-label="Project list" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const status = projectStatusPresentation[project.status];

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <CardDescription className="line-clamp-3 min-h-[3.75rem]">
                      {project.description ?? "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-caption text-muted-foreground">
                      Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(project.updated_at))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}
    </PageContainer>
  );
}
