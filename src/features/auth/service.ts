/**
 * Authentication service.
 *
 * TODO(Keisha):
 * 1. Implement email/password registration.
 * 2. Store full_name in user metadata.
 * 3. Implement login and logout.
 * 4. Return safe errors for invalid credentials.
 * 5. Respect email confirmation configuration.
 * 6. Never expose secret keys or raw provider errors.
 */
export async function registerUser(): Promise<void> {
  throw new Error("TODO: implement registerUser");
}

export async function loginUser(): Promise<void> {
  throw new Error("TODO: implement loginUser");
}

export async function logoutUser(): Promise<void> {
  throw new Error("TODO: implement logoutUser");
}
