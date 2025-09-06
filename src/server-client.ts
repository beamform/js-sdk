import openApiClient, { type Client } from "openapi-fetch";
import type { ServerPaths } from "./path-filters";

interface ServerClientConfig {
  baseUrl?: string;
  apiKey: string;
}

const DEFAULT_BASE_URL = "https://api.beamform.com";

/**
 * Create a server-side Beamform client for API key authentication.
 *
 * Use this client for:
 * - Creating notifications
 * - Managing API keys
 * - Creating recipient sessions
 * - Administrative operations
 *
 * @example
 * ```typescript
 * import { createServerClient } from '@beamform/js-sdk'
 *
 * const client = createServerClient({ apiKey: 'sk_your_api_key' })
 *
 * // Create a notification
 * const { data } = await client.POST('/v1/notifications', {
 *   body: { subject: 'Hello', content: 'World', recipients: ['user_123'] }
 * })
 *
 * // Create a session for a recipient
 * const { data: session } = await client.POST('/v1/auth/recipients/{recipient_id}/sessions', {
 *   params: { path: { recipient_id: 'user_123' } }
 * })
 * ```
 */
const createServerClient = (config: ServerClientConfig): Client<ServerPaths> => {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;

  return openApiClient<ServerPaths>({
    baseUrl,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });
};

export { createServerClient, DEFAULT_BASE_URL };
export type { ServerClientConfig };
