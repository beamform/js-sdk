import openApiClient from "openapi-fetch";
import type { ServerPaths } from "../path-filters";
import { type AuthMethods, createAuthMethods } from "./auth";
import { createNotificationMethods, type NotificationMethods } from "./notifications";
import { createSessionMethods, type SessionMethods } from "./sessions";

interface ServerClientConfig {
  baseUrl?: string;
  apiKey: string;
}

export interface ServerClient extends AuthMethods, NotificationMethods, SessionMethods {}

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
 * import { createServerClient } from '@beamformio/js-sdk'
 *
 * const client = createServerClient({ apiKey: 'sk_your_api_key' })
 *
 * // Create a notification
 * const notification = await client.createNotification({
 *   data: { subject: 'Welcome', content: 'Welcome to our app!', recipients: ['user123'] }
 * })
 *
 * // Create a session for a recipient
 * const session = await client.createSession({
 *   recipient_id: 'user123',
 *   data: { sessionLifetime: '24h' }
 * })
 *
 * // Create an API key
 * const key = await client.createKey({ data: { name: 'My Key', permissions: ['keys:read'] } })
 * ```
 */
const createServerClient = (config: ServerClientConfig): ServerClient => {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;

  const rawClient = openApiClient<ServerPaths>({
    baseUrl,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  const authMethods = createAuthMethods(rawClient);
  const notificationMethods = createNotificationMethods(rawClient);
  const sessionMethods = createSessionMethods(rawClient);

  return {
    ...authMethods,
    ...notificationMethods,
    ...sessionMethods,
  };
};

export { createServerClient, DEFAULT_BASE_URL };
export type { ServerClientConfig };
