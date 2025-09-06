// Client-side (browser) - session token authentication

export type { ClientConfig as BeamformClientConfig } from "./client";
export {
	clear,
	createClient,
	getRefreshToken,
	isAuthenticated,
} from "./client";
// Generated OpenAPI types
export type { components, paths } from "./generated/schema";
// Path filtering types (useful for custom implementations)
export type { ClientPaths, ServerPaths } from "./path-filters";
export type { ServerClientConfig } from "./server-client";
// Server-side - API key authentication
export { createServerClient } from "./server-client";
// Utility functions
export { formatError } from "./utils";
