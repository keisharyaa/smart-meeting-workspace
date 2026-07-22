/**
 * Workspace Layout
 *
 * TODO:
 * 1. Verify the authenticated user on the server.
 * 2. Redirect unauthenticated users to `/login`.
 * 3. Render the shared sidebar and header.
 * 4. Keep page-specific data fetching inside each route or feature query.
 * 5. Do not query feature tables directly from this layout.
 * 6. Keep the layout usable on laptop and tablet widths.
 */

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen">
      <aside>{/* TODO: render AppSidebar */}</aside>

      <div>
        <header>{/* TODO: render AppHeader */}</header>

        <main>{children}</main>
      </div>
    </div>
  );
}