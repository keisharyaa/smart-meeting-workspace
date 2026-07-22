/**
 * Shared workspace header.
 *
 * TODO:
 * 1. Display the current page or workspace context.
 * 2. Show the authenticated user's name or profile summary.
 * 3. Provide access to account settings and logout.
 * 4. Show unread reminder count when implemented.
 * 5. Keep authentication logic inside the auth feature layer.
 * 6. Do not query Supabase directly from this component.
 */

export function AppHeader() {
  return (
    <header>
      <div>
        <p>Smart Meeting Workspace</p>
      </div>

      <div>
        <span>Workspace User</span>
      </div>
    </header>
  );
}