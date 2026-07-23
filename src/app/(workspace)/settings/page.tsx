import { logoutAction } from "@/features/auth/actions";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Review the account currently connected to this workspace."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Workspace account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-caption text-muted-foreground">Email address</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {user?.email ?? "Email unavailable"}
            </p>
          </div>

          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
