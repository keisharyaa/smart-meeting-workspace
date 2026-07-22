export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}
