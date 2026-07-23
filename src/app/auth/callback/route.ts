import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("error", "confirmation_failed");

  return NextResponse.redirect(redirectUrl);
}
