import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthMethods } from "../../src/auth";
import type { ClientPaths } from "../../src/path-filters";

// Mock client
const mockClient = {
  GET: vi.fn(),
  DELETE: vi.fn(),
  POST: vi.fn(),
} as unknown as Client<ClientPaths>;

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentSession", () => {
    const authMethods = createAuthMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const mockSessionData = {
        sessionId: "ses_123",
        createdAt: "2024-01-01T00:00:00Z",
        expiresAt: "2024-01-02T00:00:00Z",
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockSessionData,
        error: null,
      });

      const result = await authMethods.getCurrentSession();

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/auth/session/current");
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSessionData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Session expired" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(authMethods.getCurrentSession()).rejects.toThrow(
        "Failed to get current session: Session expired"
      );
    });
  });

  describe("deleteCurrentSession", () => {
    const authMethods = createAuthMethods(mockClient);

    it("should call correct endpoint on success", async () => {
      mockClient.DELETE = vi.fn().mockResolvedValue({
        error: null,
      });

      await authMethods.deleteCurrentSession();

      expect(mockClient.DELETE).toHaveBeenCalledWith("/v1/auth/session/current");
      expect(mockClient.DELETE).toHaveBeenCalledTimes(1);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Session not found" };

      mockClient.DELETE = vi.fn().mockResolvedValue({
        error: apiError,
      });

      await expect(authMethods.deleteCurrentSession()).rejects.toThrow(
        "Failed to delete current session: Session not found"
      );
    });
  });

  describe("refreshSessionToken", () => {
    const authMethods = createAuthMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const refreshToken = "sr_refresh_token_123";
      const mockTokenData = {
        sessionToken: "new_session_token_456",
        refreshToken: "new_refresh_token_789",
        expiresAt: "2024-01-02T00:00:00Z",
      };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: mockTokenData,
        error: null,
      });

      const result = await authMethods.refreshSessionToken(refreshToken);

      expect(mockClient.POST).toHaveBeenCalledWith("/v1/auth/tokens/refresh", {
        body: { refreshToken },
      });
      expect(mockClient.POST).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTokenData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Invalid refresh token" };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(authMethods.refreshSessionToken("invalid_token")).rejects.toThrow(
        "Failed to refresh session token: Invalid refresh token"
      );
    });
  });
});
