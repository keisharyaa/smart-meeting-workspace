import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to review meeting outcomes and track follow-up work.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error === "confirmation_failed" ? (
          <p
            role="alert"
            className="mb-5 rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
          >
            We could not confirm your account. Please try signing in or
            registering again.
          </p>
        ) : null}
        {message === "password_updated" ? (
          <p
            role="status"
            className="mb-5 rounded-md border border-success/20 bg-success-background px-3 py-2 text-sm text-success-foreground"
          >
            Your password has been updated. Sign in with your new password.
          </p>
        ) : null}
        <LoginForm />
      </CardContent>
    </Card>
  );
}
