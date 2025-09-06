import createClient, { type Client } from 'openapi-fetch'
import type { ClientPaths } from './path-filters'

export interface BeamformClientConfig {
  baseUrl?: string
  headers?: Record<string, string>
  autoRefresh?: boolean // Enable automatic token refresh (default: true)
}

interface TokenData {
  sessionToken: string
  refreshToken: string
  expiresAt: Date
}

/**
 * Client-side Beamform client for session token authentication.
 * 
 * Use this client for:
 * - Reading recipient inbox
 * - Getting current session info
 * - Browser-based recipient operations
 * 
 * @example
 * ```typescript
 * const client = new BeamformClient()
 * await client.initialize('sr_refresh_token_from_server')
 * 
 * // Get current user's inbox
 * const { data: inbox } = await client.api.GET('/v1/inbox/current')
 * 
 * // Get current session
 * const { data: session } = await client.api.GET('/v1/auth/session/current')
 * ```
 */
export class BeamformClient {
  private static readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000 // 5 minutes
  
  private tokens?: TokenData
  private refreshTimer?: ReturnType<typeof setTimeout>
  private autoRefresh: boolean
  private baseUrl: string
  private customHeaders: Record<string, string>

  constructor(config: BeamformClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? 'https://api.beamform.com'
    this.customHeaders = config.headers ?? {}
    this.autoRefresh = config.autoRefresh ?? true
  }

  /**
   * Get the OpenAPI client with automatic session token management.
   * Only client-side endpoints are available (session token authentication).
   */
  get api(): Client<ClientPaths> {
    return createClient<ClientPaths>({
      baseUrl: this.baseUrl,
      headers: this.customHeaders,
      fetch: async (input: Request | string | URL, init?: RequestInit) => {
        const token = await this.getValidSessionToken()
        
        // Handle different input types
        let url: string
        let options: RequestInit = init || {}
        
        if (input instanceof Request) {
          url = input.url
          options = {
            method: input.method,
            headers: input.headers,
            body: input.body,
            ...options
          }
        } else {
          url = input.toString()
        }
        
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        })
      }
    })
  }

  /**
   * Initialize client-side authentication with refresh token from server.
   * This will immediately get a session token and start auto-refresh.
   */
  async initialize(refreshToken: string): Promise<void> {
    await this.refreshTokens(refreshToken)
    if (this.autoRefresh) {
      this.scheduleTokenRefresh()
    }
  }

  /**
   * Get valid session token, refreshing automatically if needed.
   */
  private async getValidSessionToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('Not authenticated - call initialize() first with refresh token')
    }

    if (this.isSessionTokenExpiringSoon()) {
      await this.refreshTokens(this.tokens.refreshToken)
    }

    return this.tokens.sessionToken
  }

  /**
   * Check if session token is expiring within 5 minutes.
   */
  private isSessionTokenExpiringSoon(): boolean {
    if (!this.tokens) return true
    
    const now = new Date()
    return now.getTime() + BeamformClient.TOKEN_REFRESH_BUFFER_MS >= this.tokens.expiresAt.getTime()
  }

  /**
   * Refresh tokens using current refresh token.
   */
  private formatError(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      if ('status' in error && 'statusText' in error) {
        return `${error.status} ${error.statusText}`
      }
      if ('message' in error && typeof error.message === 'string') {
        return error.message
      }
    }
    return String(error)
  }

  private async refreshTokens(refreshToken: string): Promise<void> {
    const tempClient = createClient<ClientPaths>({
      baseUrl: this.baseUrl,
      headers: this.customHeaders
    })

    const { data, error } = await tempClient.POST('/v1/auth/tokens/refresh', {
      body: { refreshToken }
    })

    if (error) {
      throw new Error(`Token refresh failed: ${this.formatError(error)}`)
    }

    this.tokens = {
      sessionToken: data.sessionToken,
      refreshToken: data.refreshToken,
      expiresAt: new Date(data.expiresAt)
    }
  }

  /**
   * Schedule proactive token refresh before expiration.
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }

    if (!this.tokens) return

    const now = new Date()
    const refreshTime = this.tokens.expiresAt.getTime() - BeamformClient.TOKEN_REFRESH_BUFFER_MS
    const delay = Math.max(0, refreshTime - now.getTime())

    if (delay <= 0) return

    this.refreshTimer = setTimeout(async () => {
      try {
        if (this.tokens && this.isSessionTokenExpiringSoon()) {
          await this.refreshTokens(this.tokens.refreshToken)
          this.scheduleTokenRefresh()
        }
      } catch (error) {
        console.warn('Proactive token refresh failed. Token will be refreshed on next API call. Error:', error)
      }
      this.refreshTimer = undefined
    }, delay)
  }

  /**
   * Manually refresh session token (useful for error recovery).
   */
  async refreshSession(): Promise<{ sessionToken: string; refreshToken: string; expiresAt: string }> {
    if (!this.tokens) {
      throw new Error('No refresh token available - call initialize() first')
    }

    await this.refreshTokens(this.tokens.refreshToken)
    
    return {
      sessionToken: this.tokens.sessionToken,
      refreshToken: this.tokens.refreshToken,
      expiresAt: this.tokens.expiresAt.toISOString()
    }
  }

  /**
   * Get current refresh token (useful for persistence across page reloads).
   */
  getRefreshToken(): string | undefined {
    return this.tokens?.refreshToken
  }

  /**
   * Clear all authentication state and stop auto-refresh.
   */
  clearTokens(): void {
    this.tokens = undefined
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }

  /**
   * Update base URL for API requests.
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl
  }

  /**
   * Check if client is currently authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.tokens
  }

  /**
   * Get current session expiration time.
   */
  getSessionExpiresAt(): Date | undefined {
    return this.tokens?.expiresAt
  }
}