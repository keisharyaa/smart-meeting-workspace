import { createClient } from "@/lib/supabase/server";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegistrationInput {
  fullName: string;
  currentPosition: string;
  email: string;
  password: string;
  emailRedirectTo?: string;
}

export type RegistrationErrorCode =
  | "email_exists"
  | "weak_password"
  | "request_failed";

export class RegistrationError extends Error {
  constructor(public readonly code: RegistrationErrorCode) {
    super(code);
    this.name = "RegistrationError";
  }
}

export interface RegistrationResult {
  requiresEmailConfirmation: boolean;
}

/**
 * Authenticates a workspace owner through Supabase Auth.
 * Provider details stay on the server and callers receive safe errors only.
 */
export async function loginUser({
  email,
  password,
}: LoginInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("The email or password is incorrect.");
  }
}

export async function registerUser({
  fullName,
  currentPosition,
  email,
  password,
  emailRedirectTo,
}: RegistrationInput): Promise<RegistrationResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          current_position: currentPosition,
        },
      },
    });

    if (error) {
      if (error.code === "user_already_exists") {
        throw new RegistrationError("email_exists");
      }

      if (error.code === "weak_password") {
        throw new RegistrationError("weak_password");
      }

      throw new RegistrationError("request_failed");
    }

    if (!data.user) {
      throw new RegistrationError("request_failed");
    }

    if (data.user.identities?.length === 0) {
      throw new RegistrationError("email_exists");
    }

    return {
      requiresEmailConfirmation: !data.session,
    };
  } catch (error) {
    if (error instanceof RegistrationError) {
      throw error;
    }

    throw new RegistrationError("request_failed");
  }
}

export async function logoutUser(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("We could not sign you out. Please try again.");
  }
}
