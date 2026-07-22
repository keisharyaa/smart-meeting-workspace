import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Shared heading block for workspace pages.
 *
 * TODO:
 * 1. Keep title, description, and page actions aligned consistently.
 * 2. Support responsive stacking when actions do not fit.
 * 3. Keep feature-specific data outside this component.
 */
export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header>
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>

      {actions ? <div>{actions}</div> : null}
    </header>
  );
}