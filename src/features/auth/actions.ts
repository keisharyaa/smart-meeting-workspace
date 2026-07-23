"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authConfig } from "@/config/auth";

import {
  loginUser,
  logoutUser,
  registerUser,
  RegistrationError,
} from "./service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginActionState {
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
}

export interface RegistrationActionState {
  status: "idle" | "success";
  message: string | null;
  fieldErrors: {
    fullName?: string;
    currentPosition?: string;
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

  if (!emailPattern.test(email)) {
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

export async function registerAction(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const currentPosition = String(
    formData.get("currentPosition") ?? "",
  ).trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: RegistrationActionState["fieldErrors"] = {};

  if (!fullName) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!currentPosition) {
    fieldErrors.currentPosition = "Current position is required.";
  }

  if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < authConfig.minimumPasswordLength) {
    fieldErrors.password = `Password must be at least ${authConfig.minimumPasswordLength} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "idle",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  let requiresEmailConfirmation = false;

  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin");
    const result = await registerUser({
      fullName,
      currentPosition,
      email,
      password,
      emailRedirectTo: origin
        ? new URL("/auth/callback", origin).toString()
        : undefined,
    });

    requiresEmailConfirmation = result.requiresEmailConfirmation;
  } catch (error) {
    if (error instanceof RegistrationError) {
      if (error.code === "email_exists") {
        return {
          status: "idle",
          message: "An account with this email already exists.",
          fieldErrors: {
            email: "Use another email or return to Login.",
          },
        };
      }

      if (error.code === "weak_password") {
        return {
          status: "idle",
          message: "The password does not meet the configured requirements.",
          fieldErrors: {
            password: "Choose a stronger password and try again.",
          },
        };
      }
    }

    console.error("Registration failed:", error);

    return {
      status: "idle",
      message: "We could not create your account. Please try again.",
      fieldErrors: {},
    };
  }

  if (requiresEmailConfirmation) {
    return {
      status: "success",
      message:
        "Account created. Check your email to confirm your account, then sign in.",
      fieldErrors: {},
    };
  }

  redirect("/dashboard");
}
