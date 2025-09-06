import createClient, { type Client } from 'openapi-fetch'
import type { ServerPaths } from './path-filters'

export interface BeamformServerClientConfig {
  baseUrl?: string
  apiKey: string
  headers?: Record<string, string>
}

/**
 * Server-side Beamform client for API key authentication.
 * 
 * Use this client for:
 * - Creating notifications
 * - Managing API keys  
 * - Creating recipient sessions
 * - Administrative operations
 * 
 * @example
 * ```typescript
 * const client = new BeamformServerClient({ apiKey: 'sk_your_api_key' })
 * 
 * // Create a notification
 * const { data } = await client.api.POST('/v1/notifications', {
 *   body: { subject: 'Hello', content: 'World', recipients: ['user_123'] }
 * })
 * 
 * // Create a session for a recipient
 * const { data: session } = await client.api.POST('/v1/auth/recipients/{recipient_id}/sessions', {
 *   params: { path: { recipient_id: 'user_123' } }
 * })
 * ```
 */
export class BeamformServerClient {
  private client: Client<ServerPaths>
  private baseUrl: string
  private customHeaders: Record<string, string>
  private apiKey: string

  constructor(config: BeamformServerClientConfig) {
    this.baseUrl = config.baseUrl ?? 'https://api.beamform.com'
    this.customHeaders = config.headers ?? {}
    this.apiKey = config.apiKey
    
    this.client = createClient<ServerPaths>({
      baseUrl: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...this.customHeaders
      }
    })
  }

  /**
   * Get the OpenAPI client with full type safety.
   * Only server-side endpoints are available (API key authentication).
   */
  get api(): Client<ServerPaths> {
    return this.client
  }

  /**
   * Update the API key used for authentication.
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
    this.client = createClient<ServerPaths>({
      baseUrl: this.baseUrl,
      headers: {
        ...this.customHeaders,
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  /**
   * Update the base URL for API requests.
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl
    this.client = createClient<ServerPaths>({
      baseUrl,
      headers: {
        ...this.customHeaders,
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }
}