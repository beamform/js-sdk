import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServerPaths } from "../../src/path-filters";
import { createServerAuthMethods } from "../../src/server-auth";

// Mock client
const mockClient = {
  POST: vi.fn(),
} as unknown as Client<ServerPaths>;

describe("server auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createKey", () => {
    const serverAuthMethods = createServerAuthMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const requestData = { name: "Test Key", permissions: ["read"] };
      const mockResponseData = {
        keyId: "key_123",
        name: "Test Key",
        permissions: ["read"],
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await serverAuthMethods.createKey(requestData);

      expect(mockClient.POST).toHaveBeenCalledWith("/v1/auth/keys", {
        body: requestData,
      });
      expect(mockClient.POST).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Invalid permissions" };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(serverAuthMethods.createKey({ name: "Test", permissions: [] })).rejects.toThrow(
        "Failed to create key: Invalid permissions"
      );
    });
  });
});
