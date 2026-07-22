export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | { [className: string]: boolean | null | undefined };

/**
 * Small dependency-free class name helper.
 *
 * This keeps shared UI components readable without adding a utility package.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const append = (value: ClassValue): void => {
    if (!value) return;

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }

    Object.entries(value).forEach(([className, enabled]) => {
      if (enabled) classes.push(className);
    });
  };

  inputs.forEach(append);

  return classes.join(" ");
}
