import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectForm } from "@/features/projects/components/project-form";

export default function NewProjectPage() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        eyebrow="Projects"
        title="Create project"
        description="Set up a project to organize related meetings and action items."
      />

      <Card>
        <CardContent className="pt-5">
          <ProjectForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
