"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordFormProps {
  email: string;
}

export function ChangePasswordForm({ email }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: typeof fieldErrors = {};

    if (!currentPassword) {
      nextFieldErrors.currentPassword = "Current password is required.";
    }

    if (!newPassword) {
      nextFieldErrors.newPassword = "New password is required.";
    } else if (newPassword.length < authConfig.minimumPasswordLength) {
      nextFieldErrors.newPassword = `Password must be at least ${authConfig.minimumPasswordLength} characters.`;
    }

    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = "Confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextFieldErrors.confirmPassword = "New passwords do not match.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setMessage("Please correct the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setMessage(null);
    setIsPending(true);

    const supabase = createClient();
    const { error: currentPasswordError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (currentPasswordError) {
      setIsPending(false);
      setFieldErrors({ currentPassword: "Current password is incorrect." });
      setMessage("We could not verify your current password.");
      return;
    }

    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsPending(false);

    if (updatePasswordError) {
      setMessage(
        updatePasswordError.code === "weak_password"
          ? "The new password does not meet the configured requirements."
          : "We could not change your password. Please try again.",
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password changed successfully.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
          Current password <span className="text-destructive">*</span>
        </label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.currentPassword)}
          aria-describedby={fieldErrors.currentPassword ? "current-password-error" : undefined}
        />
        {fieldErrors.currentPassword ? (
          <p id="current-password-error" className="text-helper text-destructive">
            {fieldErrors.currentPassword}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="settingsNewPassword" className="text-sm font-medium text-foreground">
          New password <span className="text-destructive">*</span>
        </label>
        <Input
          id="settingsNewPassword"
          type="password"
          autoComplete="new-password"
          minLength={authConfig.minimumPasswordLength}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.newPassword)}
          aria-describedby="settings-new-password-help settings-new-password-error"
        />
        <p id="settings-new-password-help" className="text-helper">
          Use at least {authConfig.minimumPasswordLength} characters.
        </p>
        {fieldErrors.newPassword ? (
          <p id="settings-new-password-error" className="text-helper text-destructive">
            {fieldErrors.newPassword}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmNewPassword" className="text-sm font-medium text-foreground">
          Confirm new password <span className="text-destructive">*</span>
        </label>
        <Input
          id="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={fieldErrors.confirmPassword ? "confirm-new-password-error" : undefined}
        />
        {fieldErrors.confirmPassword ? (
          <p id="confirm-new-password-error" className="text-helper text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      {message ? (
        <p
          role={message === "Password changed successfully." ? "status" : "alert"}
          className={
            message === "Password changed successfully."
              ? "rounded-md border border-success/20 bg-success-background px-3 py-2 text-sm text-success-foreground"
              : "rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
          }
        >
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Changing password..." : "Change password"}
      </Button>
    </form>
  );
}
