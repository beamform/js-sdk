import createClient, { type Client } from 'openapi-fetch'
import type { paths } from './generated/schema'

export interface BeamformClientConfig {
  baseUrl?: string
  apiKey?: string
  headers?: Record<string, string>
}

export class BeamformClient {
  private client: Client<paths>

  constructor(config: BeamformClientConfig = {}) {
    const baseUrl = config.baseUrl ?? 'https://api.beamform.com'
    
    this.client = createClient<paths>({
      baseUrl,
      headers: {
        ...config.headers,
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` })
      }
    })
  }

  get api() {
    return this.client
  }

  setApiKey(apiKey: string) {
    const currentConfig = this.client as any
    this.client = createClient<paths>({
      baseUrl: currentConfig.baseUrl,
      headers: {
        ...currentConfig.headers,
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  setBaseUrl(baseUrl: string) {
    const currentConfig = this.client as any
    this.client = createClient<paths>({
      baseUrl,
      headers: currentConfig.headers
    })
  }
}