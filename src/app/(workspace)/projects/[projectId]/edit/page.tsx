import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateProjectAction } from "@/features/projects/actions";
import { ProjectForm } from "@/features/projects/components/project-form";
import { getCurrentUserProject } from "@/features/projects/queries";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = await params;
  const { project, error } = await getCurrentUserProject(projectId);

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Projects" title="Edit project" />
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
        <PageHeader eyebrow="Projects" title="Edit project" />
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

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        eyebrow="Projects"
        title="Edit project"
        description={`Update details for ${project.name}.`}
        actions={
          <Link
            href={`/projects/${project.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <ProjectForm
            projectId={project.id}
            initialValues={{
              name: project.name,
              description: project.description ?? "",
            }}
            submitAction={updateProjectAction}
            submitLabel="Save changes"
            pendingLabel="Saving changes..."
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
