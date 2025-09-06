import type { paths } from "./generated/schema";

// Server-side paths (API key authentication)
export type ServerPaths = Pick<
  paths,
  | "/v1/auth/keys"
  | "/v1/auth/keys/{key_id}"
  | "/v1/auth/keys/{key_id}/check"
  | "/v1/auth/recipients/{recipient_id}/sessions"
  | "/v1/auth/recipients/{recipient_id}/sessions/{session_id}"
  | "/v1/inbox/recipients/{recipient_id}"
  | "/v1/notifications"
  | "/v1/notifications/{id}"
>;

// Client-side paths (session token authentication)
export type ClientPaths = Pick<
  paths,
  "/v1/auth/session/current" | "/v1/auth/tokens/refresh" | "/v1/inbox/current"
>;
