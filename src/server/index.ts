import openApiClient from "openapi-fetch";
import type { ServerPaths } from "../path-filters";
import { type AuthMethods, createAuthMethods } from "./auth";

interface ServerClientConfig {
  baseUrl?: string;
  apiKey: string;
}

export interface ServerClient extends AuthMethods {}

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
 * // Create an API key
 * const key = await client.createKey({ name: 'My Key', permissions: ['read'] })
 *
 * // List API keys
 * const keys = await client.listKeys()
 *
 * // Get an API key
 * const key = await client.getKey('key_123')
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

  return {
    ...authMethods,
  };
};

export { createServerClient, DEFAULT_BASE_URL };
export type { ServerClientConfig };
