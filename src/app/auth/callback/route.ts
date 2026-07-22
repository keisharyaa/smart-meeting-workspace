import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase Authentication Callback
 *
 * TODO(Keisha):
 * 1. Read the authorization code from the callback URL.
 * 2. Exchange the code for a Supabase session.
 * 3. Redirect successful authentication to `/dashboard`.
 * 4. Redirect failed callbacks to `/login` with a safe error state.
 * 5. Do not expose raw provider errors in the URL.
 */

export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/login", request.url);

  redirectUrl.searchParams.set(
    "message",
    "Authentication callback is not implemented yet.",
  );

  return NextResponse.redirect(redirectUrl);
}