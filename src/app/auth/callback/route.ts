import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = new Set(["/dashboard"]);

function getSafeNextPath(nextPath: string | null) {
  return nextPath && allowedNextPaths.has(nextPath) ? nextPath : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("error", "confirmation_failed");

  return NextResponse.redirect(redirectUrl);
}
