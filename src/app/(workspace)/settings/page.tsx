import Link from "next/link";

import { logoutAction } from "@/features/auth/actions";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/settings/components/change-password-form";
import { EmailChangeForm } from "@/features/settings/components/email-change-form";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Account" title="Settings" />
        <ErrorState
          title="Account unavailable"
          message="Please sign in again to access account settings."
          action={<Link href="/login" className="text-sm font-medium text-primary hover:underline">Go to Login</Link>}
        />
      </PageContainer>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, current_position")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Account" title="Settings" />
        <ErrorState
          title="Settings are unavailable"
          message="We could not load your profile. Please refresh the page and try again."
        />
      </PageContainer>
    );
  }

  const fullName = profile?.full_name ?? user.user_metadata.full_name ?? "";
  const currentPosition =
    profile?.current_position ?? user.user_metadata.current_position ?? "";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Review the account currently connected to this workspace."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProfileSettingsForm
            fullName={fullName}
            currentPosition={currentPosition}
          />
        </CardContent>
      </Card>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Email address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-caption text-muted-foreground">Current email</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {user.email ?? "Email unavailable"}
            </p>
          </div>

          <EmailChangeForm />
        </CardContent>
      </Card>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Password and sign out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-caption text-muted-foreground">Change password</p>
            <p className="mt-1 text-sm text-foreground">
              Verify your current password before choosing a new one.
            </p>
          </div>

          <ChangePasswordForm email={user.email ?? ""} />

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
