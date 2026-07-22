import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageContainer } from "@/components/layout/page-container";

/**
 * Workspace Layout
 *
 * TODO:
 * 1. Verify the authenticated user on the server.
 * 2. Redirect unauthenticated users to `/login`.
 * 3. Render responsive sidebar and header behavior.
 * 4. Keep page-specific data fetching inside each feature query.
 * 5. Do not query feature tables directly from this layout.
 */

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen">
      <aside>
        <AppSidebar />
      </aside>

      <div>
        <AppHeader />

        <PageContainer>
          <main>{children}</main>
        </PageContainer>
      </div>
    </div>
  );
}