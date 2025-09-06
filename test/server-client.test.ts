import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createServerClient,
  DEFAULT_BASE_URL,
  type ServerClientConfig,
} from "../src/server-client";

vi.mock("openapi-fetch");

describe("createServerClient - Client Creation", () => {
  let mockOpenApiClient: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const openApiFetch = await import("openapi-fetch");
    mockOpenApiClient = vi.mocked(openApiFetch.default);
    mockOpenApiClient.mockReturnValue({
      GET: vi.fn(),
      POST: vi.fn(),
      PUT: vi.fn(),
      DELETE: vi.fn(),
    });
  });

  describe("Creates client with required apiKey", () => {
    it("should create client successfully with minimal config", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
      };

      const client = createServerClient(config);

      expect(client).toBeDefined();
      expect(mockOpenApiClient).toHaveBeenCalledTimes(1);
      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: expect.any(String),
        headers: {
          Authorization: "Bearer sk_test_key",
        },
      });
    });
  });

  describe("Uses default baseUrl when not provided", () => {
    it("should use the exported DEFAULT_BASE_URL", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
      };

      createServerClient(config);

      expect(mockOpenApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: DEFAULT_BASE_URL,
        }),
      );
    });
  });

  describe("Uses custom baseUrl when provided", () => {
    it("should respect custom baseUrl in config", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_key",
        baseUrl: "https://custom.api.com",
      };

      createServerClient(config);

      expect(mockOpenApiClient).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: "https://custom.api.com",
        }),
      );
    });
  });

  describe("Authentication Headers", () => {
    it("should set Authorization header with Bearer prefix", () => {
      const config: ServerClientConfig = {
        apiKey: "sk_test_12345",
      };

      createServerClient(config);

      expect(mockOpenApiClient).toHaveBeenCalledWith({
        baseUrl: expect.any(String),
        headers: {
          Authorization: "Bearer sk_test_12345",
        },
      });
    });

    it("should work with different apiKey formats", () => {
      const testCases = [
        "sk_test_short",
        "sk_live_very_long_api_key_with_underscores_and_numbers_123456789",
        "sk_test_with-dashes-and_underscores_123",
      ];

      testCases.forEach((apiKey) => {
        vi.clearAllMocks();

        createServerClient({ apiKey });

        expect(mockOpenApiClient).toHaveBeenCalledWith({
          baseUrl: expect.any(String),
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
      });
    });
  });
});
