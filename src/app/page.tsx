import { redirect } from "next/navigation";

/**
 * Root Route
 *
 * TODO(Keisha):
 * 1. Redirect unauthenticated users to `/login`.
 * 2. Redirect authenticated users to `/dashboard`.
 * 3. Replace this temporary redirect after auth session routing is implemented.
 */
export default function HomePage() {
  redirect("/login");
}