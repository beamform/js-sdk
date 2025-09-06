/**
 * Format error for better error messages.
 */
export function formatError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("status" in error && "statusText" in error) {
      return `${error.status} ${error.statusText}`;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return String(error);
}
