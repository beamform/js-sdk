import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServerPaths } from "../../src/path-filters";
import { createSessionMethods } from "../../src/server/sessions";

const mockClient = {
  POST: vi.fn(),
  GET: vi.fn(),
  DELETE: vi.fn(),
} as unknown as Client<ServerPaths>;

describe("server sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    const sessionMethods = createSessionMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const recipientId = "user_123";
      const requestData = {
        sessionLifetime: "24h",
        sessionTokenLifetime: "2h",
      };
      const mockResponseData = {
        sessionId: "ses_01HM4X5N9JKQRT8WVYZ2B6EP",
        refreshToken: "sr_8vN2H3kL9mP4qR7sT1uX5yZ8bC6fG2hJ4kM7nQ9rS3vW",
        expiresAt: "2024-01-02T10:00:00Z",
      };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await sessionMethods.createSession({
        recipient_id: recipientId,
        data: requestData,
      });

      expect(mockClient.POST).toHaveBeenCalledWith("/v1/auth/recipients/{recipient_id}/sessions", {
        params: { path: { recipient_id: recipientId } },
        body: requestData,
      });
      expect(mockClient.POST).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Invalid recipient" };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        sessionMethods.createSession({
          recipient_id: "invalid",
          data: { sessionLifetime: "24h" },
        })
      ).rejects.toThrow("Failed to create session: Invalid recipient");
    });
  });

  describe("listSessions", () => {
    const sessionMethods = createSessionMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const recipientId = "user_123";
      const mockResponseData = {
        sessions: [
          {
            sessionId: "ses_01HM4X5N9JKQRT8WVYZ2B6EP",
            createdAt: "2024-01-01T10:00:00Z",
            expiresAt: "2024-01-02T10:00:00Z",
          },
        ],
        nextCursor: null,
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await sessionMethods.listSessions({
        recipient_id: recipientId,
        cursor: null,
        pageSize: 50,
      });

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/auth/recipients/{recipient_id}/sessions", {
        params: { path: { recipient_id: recipientId, cursor: null, pageSize: 50 } },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Recipient not found" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        sessionMethods.listSessions({
          recipient_id: "nonexistent",
          cursor: null,
          pageSize: 50,
        })
      ).rejects.toThrow("Failed to list sessions: Recipient not found");
    });
  });

  describe("getSession", () => {
    const sessionMethods = createSessionMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const recipientId = "user_123";
      const sessionId = "ses_01HM4X5N9JKQRT8WVYZ2B6EP";
      const mockResponseData = {
        sessionId: "ses_01HM4X5N9JKQRT8WVYZ2B6EP",
        createdAt: "2024-01-01T10:00:00Z",
        expiresAt: "2024-01-02T10:00:00Z",
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await sessionMethods.getSession({
        recipient_id: recipientId,
        session_id: sessionId,
      });

      expect(mockClient.GET).toHaveBeenCalledWith(
        "/v1/auth/recipients/{recipient_id}/sessions/{session_id}",
        {
          params: { path: { recipient_id: recipientId, session_id: sessionId } },
        }
      );
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Session not found" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        sessionMethods.getSession({
          recipient_id: "user_123",
          session_id: "nonexistent",
        })
      ).rejects.toThrow("Failed to get session: Session not found");
    });
  });

  describe("deleteSession", () => {
    const sessionMethods = createSessionMethods(mockClient);

    it("should call correct endpoint on success", async () => {
      const recipientId = "user_123";
      const sessionId = "ses_01HM4X5N9JKQRT8WVYZ2B6EP";

      mockClient.DELETE = vi.fn().mockResolvedValue({
        error: null,
      });

      await sessionMethods.deleteSession({
        recipient_id: recipientId,
        session_id: sessionId,
      });

      expect(mockClient.DELETE).toHaveBeenCalledWith(
        "/v1/auth/recipients/{recipient_id}/sessions/{session_id}",
        {
          params: { path: { recipient_id: recipientId, session_id: sessionId } },
        }
      );
      expect(mockClient.DELETE).toHaveBeenCalledTimes(1);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Session not found" };

      mockClient.DELETE = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        sessionMethods.deleteSession({
          recipient_id: "user_123",
          session_id: "nonexistent",
        })
      ).rejects.toThrow("Failed to delete session: Session not found");
    });
  });

  describe("deleteAllSessions", () => {
    const sessionMethods = createSessionMethods(mockClient);

    it("should call correct endpoint on success", async () => {
      const recipientId = "user_123";

      mockClient.DELETE = vi.fn().mockResolvedValue({
        error: null,
      });

      await sessionMethods.deleteAllSessions({ recipient_id: recipientId });

      expect(mockClient.DELETE).toHaveBeenCalledWith(
        "/v1/auth/recipients/{recipient_id}/sessions",
        {
          params: { path: { recipient_id: recipientId } },
        }
      );
      expect(mockClient.DELETE).toHaveBeenCalledTimes(1);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Recipient not found" };

      mockClient.DELETE = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        sessionMethods.deleteAllSessions({ recipient_id: "nonexistent" })
      ).rejects.toThrow("Failed to delete all sessions: Recipient not found");
    });
  });
});
