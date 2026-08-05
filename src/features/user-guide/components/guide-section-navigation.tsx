import { guideNavigation } from "../content";

export function GuideSectionNavigation() {
  return (
    <nav aria-label="User Guide sections" className="rounded-lg border border-border bg-card p-4 shadow-sm lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
      <p className="text-sm font-semibold text-foreground">On this page</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
        {guideNavigation.map((group) => (
          <div key={group.label}>
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-subtle-foreground">{group.label}</p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
