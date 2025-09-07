import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createServerClient,
  DEFAULT_BASE_URL,
  type ServerClientConfig,
} from "../../src/server/index";

vi.mock("openapi-fetch");

describe("createServerClient", () => {
  let mockOpenApiClient: ReturnType<typeof vi.fn>;
  let mockRawClient: {
    GET: ReturnType<typeof vi.fn>;
    POST: ReturnType<typeof vi.fn>;
    PATCH: ReturnType<typeof vi.fn>;
    DELETE: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const openApiFetch = await import("openapi-fetch");
    mockOpenApiClient = vi.mocked(openApiFetch.default);

    mockRawClient = {
      GET: vi.fn(),
      POST: vi.fn(),
      PATCH: vi.fn(),
      DELETE: vi.fn(),
    };

    mockOpenApiClient.mockReturnValue(mockRawClient);
  });

  describe("client creation", () => {
    it("should create client with wrapper methods", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
      };

      const client = createServerClient(config);

      expect(client).toBeDefined();
      expect(client.createKey).toBeInstanceOf(Function);
      expect(client.listKeys).toBeInstanceOf(Function);
      expect(client.getKey).toBeInstanceOf(Function);
      expect(mockOpenApiClient).toHaveBeenCalledTimes(1);
      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: DEFAULT_BASE_URL,
        headers: {
          Authorization: "Bearer sk_test_key",
        },
      });
    });
  });

  describe("configuration", () => {
    it("should use default baseUrl when not provided", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
      };

      createServerClient(config);

      expect(mockOpenApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: DEFAULT_BASE_URL,
        })
      );
    });

    it("should respect custom baseUrl in config", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
        baseUrl: "https://custom.api.com",
      };

      createServerClient(config);

      expect(mockOpenApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: "https://custom.api.com",
        })
      );
    });

    it("should set Authorization header with Bearer prefix", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_12345",
      };

      createServerClient(config);

      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: DEFAULT_BASE_URL,
        headers: {
          Authorization: "Bearer sk_test_12345",
        },
      });
    });
  });

  describe("wrapper functionality", () => {
    it("should call underlying auth methods correctly", async () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
      };

      const mockKeyData = { keyId: "key_123", name: "Test Key" };
      mockRawClient.POST.mockResolvedValue({ data: mockKeyData, error: null });

      const client = createServerClient(config);
      const result = await client.createKey({ data: { name: "Test Key", permissions: ["read"] } });

      expect(mockRawClient.POST).toHaveBeenCalledWith("/v1/auth/keys", {
        body: { name: "Test Key", permissions: ["read"] },
      });
      expect(result).toEqual(mockKeyData);
    });
  });
});
