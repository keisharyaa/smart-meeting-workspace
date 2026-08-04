import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { listDeadlineReminders } from "@/features/reminders/repository";
import { createClient } from "@/lib/supabase/server";

/**
 * Workspace Layout
 *
 * TODO(auth owner):
 * 1. Verify the authenticated user on the server.
 * 2. Redirect unauthenticated users to `/login`.
 * 3. Pass authenticated profile data to the header.
 *
 * Page-specific data fetching remains inside each route or
 * feature query.
 */
interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name?.trim() || user.user_metadata.full_name || null;
  let unreadReminderCount = 0;

  try {
    const { summary } = await listDeadlineReminders(user.id);
    unreadReminderCount = summary.unread;
  } catch (error) {
    console.error("Unable to load reminder count:", error);
  }

  return (
    <div className="workspace-grid">
      <AppSidebar />

      <div className="min-w-0">
        <AppHeader
          fullName={fullName}
          unreadReminderCount={unreadReminderCount}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
