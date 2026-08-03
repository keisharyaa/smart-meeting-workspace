"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updatePicInformation } from "./repository";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PicInformationActionState {
  status: "idle";
  message: string | null;
  fieldErrors: {
    fullName?: string;
    email?: string;
    role?: string;
  };
}

export async function updatePicInformationAction(
  _previousState: PicInformationActionState,
  formData: FormData,
): Promise<PicInformationActionState> {
  const personKey = String(formData.get("personKey") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "").trim();
  const fieldErrors: PicInformationActionState["fieldErrors"] = {};

  if (!personKey) {
    return {
      status: "idle",
      message: "This PIC is not available.",
      fieldErrors: {},
    };
  }

  if (!fullName) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (email && !emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "idle",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  let updatedPersonKey = personKey;

  try {
    const userId = await getCurrentUserId();

    updatedPersonKey = await updatePicInformation(userId, personKey, {
      fullName,
      email: email || null,
      role: role || null,
    });
  } catch (error) {
    console.error("Unable to update PIC information:", error);

    return {
      status: "idle",
      message: "We could not update this PIC. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/people");
  revalidatePath(`/people/${personKey}`);
  revalidatePath(`/people/${updatedPersonKey}`);
  revalidatePath("/action-items");
  revalidatePath("/dashboard");
  revalidatePath("/reminders");

  redirect(`/people/${updatedPersonKey}`);
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in before updating PIC information.");
  }

  return user.id;
}

