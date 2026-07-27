import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Root Route
 *
 * TODO(Keisha):
 * 1. Redirect unauthenticated users to `/login`.
 * 2. Redirect authenticated users to `/dashboard`.
 * 3. Replace this temporary redirect after auth session routing is implemented.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
