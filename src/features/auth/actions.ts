"use server";

import { redirect } from "next/navigation";

import { loginUser, logoutUser } from "./service";

export interface LoginActionState {
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: LoginActionState["fieldErrors"] = {};

  if (!email || !email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    await loginUser({ email, password });
  } catch (error) {
    console.error("Login failed:", error);

    return {
      message: "The email or password is incorrect.",
      fieldErrors: {},
    };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  try {
    await logoutUser();
  } catch (error) {
    console.error("Logout failed:", error);
    redirect("/settings?message=Unable%20to%20sign%20out");
  }

  redirect("/login");
}
