/**
 * Safe application-level error.
 *
 * TODO:
 * 1. Wrap low-level provider/database errors.
 * 2. Expose only safe messages to the UI.
 * 3. Add stable error codes only when required by UI logic.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code = "UNKNOWN_ERROR",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
