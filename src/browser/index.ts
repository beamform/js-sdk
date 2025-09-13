import openApiClient from "openapi-fetch";
import type { ClientPaths } from "../path-filters";
import { formatError } from "../utils";
import { type AuthMethods, createAuthMethods } from "./auth";
import { createInboxMethods, type InboxMethods } from "./inbox";

interface BrowserClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  autoRefresh?: boolean;
}

interface TokenData {
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
}

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

let tokens: TokenData | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let baseUrl: string = "https://api.beamform.com";
let customHeaders: Record<string, string> = {};
let autoRefresh: boolean = true;

interface BrowserClient extends InboxMethods, AuthMethods {}

/**
 * Create an authenticated Beamform client with automatic token management.
 *
 * @example
 * ```typescript
 * import { createClient } from '@beamformio/js-sdk'
 *
 * const client = await createClient('sr_refresh_token_from_server', {
 *   baseUrl: 'https://api.example.com',
 *   headers: { 'Custom-Header': 'value' }
 * })
 *
 * // Use clean wrapper methods
 * const inbox = await client.getCurrentInbox()
 * const session = await client.getCurrentSession()
 * await client.deleteCurrentSession()
 * ```
 */
const createClient = async (
  refreshToken: string,
  config: BrowserClientConfig = {}
): Promise<BrowserClient> => {
  baseUrl = config.baseUrl ?? "https://api.beamform.com";
  customHeaders = config.headers ?? {};
  autoRefresh = config.autoRefresh ?? true;

  await refreshTokens(refreshToken);

  if (autoRefresh) {
    scheduleTokenRefresh();
  }

  const rawClient = openApiClient<ClientPaths>({
    baseUrl,
    headers: customHeaders,
    fetch: async (input: Request | string | URL, init?: RequestInit) => {
      const token = await getValidSessionToken();

      let url: string;
      let options: RequestInit = init || {};

      if (input instanceof Request) {
        url = input.url;
        const requestHeaders: Record<string, string> = {};
        input.headers.forEach((value, key) => {
          requestHeaders[key] = value;
        });
        options = {
          method: input.method,
          headers: requestHeaders,
          body: input.body,
          ...options,
        };
      } else {
        url = input.toString();
      }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });

  const inboxMethods = createInboxMethods(rawClient);
  const authMethods = createAuthMethods(rawClient);

  return {
    ...inboxMethods,
    ...authMethods,
  };
};

const getValidSessionToken = async (): Promise<string> => {
  if (!tokens) {
    throw new Error("Not authenticated - call createClient() first with refresh token");
  }

  if (isSessionTokenExpiringSoon()) {
    await refreshTokens(tokens.refreshToken);
  }

  return tokens.sessionToken;
};

const isSessionTokenExpiringSoon = (): boolean => {
  if (!tokens) return true;

  const now = new Date();
  return now.getTime() + TOKEN_REFRESH_BUFFER_MS >= tokens.expiresAt.getTime();
};

const refreshTokens = async (refreshToken: string): Promise<void> => {
  const tempClient = openApiClient<ClientPaths>({
    baseUrl,
    headers: customHeaders,
  });

  const { data, error } = await tempClient.POST("/v1/auth/tokens/refresh", {
    body: { refreshToken },
  });

  if (error) {
    throw new Error(`Token refresh failed: ${formatError(error)}`);
  }

  tokens = {
    sessionToken: data.sessionToken,
    refreshToken: data.refreshToken,
    expiresAt: new Date(data.expiresAt),
  };
};

const scheduleTokenRefresh = (): void => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (!tokens) return;

  const now = new Date();
  const refreshTime = tokens.expiresAt.getTime() - TOKEN_REFRESH_BUFFER_MS;
  const delay = Math.max(0, refreshTime - now.getTime());

  if (delay <= 0) return;

  refreshTimer = setTimeout(async () => {
    try {
      if (tokens && isSessionTokenExpiringSoon()) {
        await refreshTokens(tokens.refreshToken);
        scheduleTokenRefresh();
      }
    } catch (error) {
      console.warn(
        "Proactive token refresh failed. Token will be refreshed on next API call. Error:",
        error
      );
    }
    refreshTimer = null;
  }, delay);
};

/**
 * Clear all authentication state and stop auto-refresh.
 */
const clear = (): void => {
  tokens = null;

  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

export { clear, createClient };
export type { BrowserClientConfig, BrowserClient };
