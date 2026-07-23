import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUserProject } from "@/features/projects/queries";
import type { ProjectStatus } from "@/features/projects/types";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const projectStatusPresentation: Record<
  ProjectStatus,
  { label: string; variant: "success" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "success" },
  done: { label: "Done", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const { project, error } = await getCurrentUserProject(projectId);

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Projects" title="Project detail" />
        <ErrorState
          title="Project is unavailable"
          message={error}
          action={
            <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
              Back to Projects
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Projects" title="Project detail" />
        <EmptyState
          title="Project not found"
          description="This project does not exist or is not available in your workspace."
          action={
            <Link href="/projects" className={buttonVariants()}>
              Back to Projects
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const status = projectStatusPresentation[project.status];

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        eyebrow="Projects"
        title={project.name}
        description="Project information and workspace record."
        actions={
          <>
            <Badge variant={status.variant}>{status.label}</Badge>
            <Link
              href={`/projects/${project.id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              Edit project
            </Link>
          </>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-caption font-medium text-muted-foreground">
                Description
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {project.description ?? "No description has been added."}
              </dd>
            </div>

            <div>
              <dt className="text-caption font-medium text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {dateFormatter.format(new Date(project.created_at))}
              </dd>
            </div>

            <div>
              <dt className="text-caption font-medium text-muted-foreground">
                Last updated
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {dateFormatter.format(new Date(project.updated_at))}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
