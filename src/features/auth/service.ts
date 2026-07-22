import { createClient } from "@/lib/supabase/server";

export interface LoginInput {
  email: string;
  password: string;
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

export async function logoutUser(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("We could not sign you out. Please try again.");
  }
}
