import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServerPaths } from "../../src/path-filters";
import { createAuthMethods } from "../../src/server/auth";

const mockClient = {
  POST: vi.fn(),
  GET: vi.fn(),
  PATCH: vi.fn(),
} as unknown as Client<ServerPaths>;

describe("server auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createKey", () => {
    const authMethods = createAuthMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const requestData = { name: "Test Key", permissions: ["keys:read" as const] };
      const mockResponseData = {
        keyId: "key_123",
        name: "Test Key",
        permissions: ["keys:read"],
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await authMethods.createKey({ data: requestData });

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

      await expect(
        authMethods.createKey({ data: { name: "Test", permissions: ["keys:read"] } })
      ).rejects.toThrow("Failed to create key: Invalid permissions");
    });
  });

  describe("listKeys", () => {
    const serverAuthMethods = createAuthMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const mockKeysData = {
        keys: [
          { keyId: "key_1", name: "Key 1", permissions: ["keys:read"] },
          { keyId: "key_2", name: "Key 2", permissions: ["keys:write"] },
        ],
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockKeysData,
        error: null,
      });

      const result = await serverAuthMethods.listKeys();

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/auth/keys", {
        params: { path: { cursor: null, pageSize: 20 } },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockKeysData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Unauthorized" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(serverAuthMethods.listKeys()).rejects.toThrow(
        "Failed to list keys: Unauthorized"
      );
    });
  });

  describe("getKey", () => {
    const serverAuthMethods = createAuthMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const keyId = "key_123";
      const mockKeyData = {
        keyId: "key_123",
        name: "Test Key",
        permissions: ["keys:read", "keys:write"],
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockKeyData,
        error: null,
      });

      const result = await serverAuthMethods.getKey({ key_id: keyId });

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/auth/keys/{key_id}", {
        params: { path: { key_id: keyId } },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockKeyData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Key not found" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(serverAuthMethods.getKey({ key_id: "nonexistent" })).rejects.toThrow(
        "Failed to get key: Key not found"
      );
    });
  });

  describe("updateKey", () => {
    const serverAuthMethods = createAuthMethods(mockClient);

    it("should call correct endpoint on success", async () => {
      const keyId = "key_123";
      const updateData = { name: "Updated Key" };

      mockClient.PATCH = vi.fn().mockResolvedValue({
        error: null,
      });

      await serverAuthMethods.updateKey({ key_id: keyId, data: updateData });

      expect(mockClient.PATCH).toHaveBeenCalledWith("/v1/auth/keys/{key_id}", {
        params: { path: { key_id: keyId } },
        body: updateData,
      });
      expect(mockClient.PATCH).toHaveBeenCalledTimes(1);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Key not found" };

      mockClient.PATCH = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        serverAuthMethods.updateKey({ key_id: "nonexistent", data: { name: "Updated" } })
      ).rejects.toThrow("Failed to update key: Key not found");
    });
  });

  describe("checkPermission", () => {
    const serverAuthMethods = createAuthMethods(mockClient);

    it("should call correct endpoint and return permission check result", async () => {
      const keyId = "key_123";
      const mockResponseData = {
        hasPermission: true,
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await serverAuthMethods.checkPermission({
        key_id: keyId,
        permission: "keys:read",
      });

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/auth/keys/{key_id}/check", {
        params: {
          path: { key_id: keyId },
          query: { permission: "keys:read" },
        },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Key not found" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        serverAuthMethods.checkPermission({
          key_id: "nonexistent",
          permission: "keys:read",
        })
      ).rejects.toThrow("Failed to check permission: Key not found");
    });
  });
});
