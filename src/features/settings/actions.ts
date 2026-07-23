"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ProfileSettingsActionState {
  status: "idle" | "success";
  message: string | null;
  fieldErrors: {
    fullName?: string;
    currentPosition?: string;
  };
}

export interface EmailChangeActionState {
  status: "idle" | "success";
  message: string | null;
  fieldErrors: {
    email?: string;
  };
}

export async function updateProfileSettingsAction(
  _previousState: ProfileSettingsActionState,
  formData: FormData,
): Promise<ProfileSettingsActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const currentPosition = String(formData.get("currentPosition") ?? "").trim();
  const fieldErrors: ProfileSettingsActionState["fieldErrors"] = {};

  if (!fullName) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!currentPosition) {
    fieldErrors.currentPosition = "Current position is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "idle",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        status: "idle",
        message: "Please sign in before updating your profile.",
        fieldErrors: {},
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, current_position: currentPosition })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Unable to update profile.");
    }
  } catch (error) {
    console.error("Profile update failed:", error);

    return {
      status: "idle",
      message: "We could not update your profile. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/settings");
  return {
    status: "success",
    message: "Profile updated successfully.",
    fieldErrors: {},
  };
}

export async function requestEmailChangeAction(
  _previousState: EmailChangeActionState,
  formData: FormData,
): Promise<EmailChangeActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return {
      status: "idle",
      message: "Please correct the highlighted field.",
      fieldErrors: { email: "Enter a valid email address." },
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        status: "idle",
        message: "Please sign in before changing your email.",
        fieldErrors: {},
      };
    }

    if (user.email?.toLowerCase() === email) {
      return {
        status: "idle",
        message: "Enter a different email address.",
        fieldErrors: { email: "This is already your current email address." },
      };
    }

    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin");
    const emailRedirectTo = origin
      ? new URL("/auth/callback?next=/settings", origin).toString()
      : undefined;
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo },
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Email change request failed:", error);

    return {
      status: "idle",
      message: "We could not start the email change. Please try again.",
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message:
      "Check both your current and new email addresses to confirm this change. Your current email remains in use until verification succeeds.",
    fieldErrors: {},
  };
}
