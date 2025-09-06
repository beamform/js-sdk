import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createServerClient, DEFAULT_BASE_URL, type ServerClientConfig } from '../src/server-client'

vi.mock('openapi-fetch')

describe('createServerClient - Client Creation', () => {
  let mockOpenApiClient: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    const openApiFetch = await import('openapi-fetch')
    mockOpenApiClient = vi.mocked(openApiFetch.default)
    mockOpenApiClient.mockReturnValue({
      GET: vi.fn(),
      POST: vi.fn(),
      PUT: vi.fn(),
      DELETE: vi.fn()
    })
  })

  describe('Creates client with required apiKey', () => {
    it('should create client successfully with minimal config', () => {
      const config: ServerClientConfig = {
        apiKey: 'sk_test_key'
      }

      const client = createServerClient(config)

      expect(client).toBeDefined()
      expect(mockOpenApiClient).toHaveBeenCalledTimes(1)
      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: expect.any(String),
        headers: {
          Authorization: 'Bearer sk_test_key'
        }
      })
    })
  })

  describe('Uses default baseUrl when not provided', () => {
    it('should use the exported DEFAULT_BASE_URL', () => {
      const config: ServerClientConfig = {
        apiKey: 'sk_test_key'
      }

      createServerClient(config)

      expect(mockOpenApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: DEFAULT_BASE_URL
        })
      )
    })
  })

  describe('Uses custom baseUrl when provided', () => {
    it('should respect custom baseUrl in config', () => {
      const config: ServerClientConfig = {
        apiKey: 'sk_test_key',
        baseUrl: 'https://custom.api.com'
      }

      createServerClient(config)

      expect(mockOpenApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://custom.api.com'
        })
      )
    })
  })

  describe('Merges custom headers with Authorization header', () => {
    it('should preserve custom headers alongside auth header', () => {
      const config: ServerClientConfig = {
        apiKey: 'sk_test_key',
        headers: {
          'Custom-Header': 'custom-value',
          'X-API-Version': '1.0'
        }
      }

      createServerClient(config)

      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: expect.any(String),
        headers: {
          Authorization: 'Bearer sk_test_key',
          'Custom-Header': 'custom-value',
          'X-API-Version': '1.0'
        }
      })
    })

    it('should allow custom headers to override Authorization (current behavior)', () => {
      const config: ServerClientConfig = {
        apiKey: 'sk_test_key',
        headers: {
          'Authorization': 'Bearer malicious_key',
          'Custom-Header': 'value'
        }
      }

      createServerClient(config)

      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: expect.any(String),
        headers: {
          Authorization: 'Bearer malicious_key', // Custom header overrides apiKey
          'Custom-Header': 'value'
        }
      })
    })
  })
})