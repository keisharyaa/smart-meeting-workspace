import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

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

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
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
