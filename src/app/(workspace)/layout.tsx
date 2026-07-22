import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
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

  return (
    <div className="workspace-grid">
      <AppSidebar />

      <div className="min-w-0">
        <AppHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
