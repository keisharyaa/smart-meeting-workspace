import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ForgotPasswordPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error } = await searchParams;
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
        <CardTitle className="text-xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we will send a secure link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error === "reset_link_invalid" ? (
          <p
            role="alert"
            className="mb-5 rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
          >
            This password reset link is invalid or has expired. Request a new link.
          </p>
        ) : null}
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
