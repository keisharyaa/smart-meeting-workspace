/**
 * Authentication Layout
 *
 * TODO(Keisha):
 * 1. Create a centered authentication container.
 * 2. Add product identity and short supporting copy.
 * 3. Keep this layout separate from workspace navigation.
 * 4. Make the layout responsive for laptop and tablet.
 * 5. Do not place authentication business logic here.
 */

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen">
      <div>{children}</div>
    </main>
  );
}