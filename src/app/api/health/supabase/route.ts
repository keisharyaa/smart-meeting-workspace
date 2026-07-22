import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const isMissingSession =
      error?.message === "Auth session missing!" ||
      error?.message === "Auth session missing";

    if (error && !isMissingSession) {
      throw error;
    }

    return NextResponse.json({
      status: "ok",
      service: "supabase",
      authenticated: Boolean(user),
    });
  } catch (error) {
    console.error("Supabase health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        service: "supabase",
        message: "Failed to connect to Supabase.",
      },
      { status: 500 },
    );
  }
}