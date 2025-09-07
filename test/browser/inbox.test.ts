import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInboxMethods } from "../../src/browser/inbox";
import type { ClientPaths } from "../../src/path-filters";

const mockClient = {
  GET: vi.fn(),
} as unknown as Client<ClientPaths>;

describe("inbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentInbox", () => {
    const inboxMethods = createInboxMethods(mockClient);

    it("should call correct endpoint and return data on success without params", async () => {
      const mockInboxData = { items: [{ id: "notif_123" }] };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockInboxData,
        error: null,
      });

      const result = await inboxMethods.getCurrentInbox();

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/inbox/current", {
        params: { query: {} },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInboxData);
    });

    it("should call correct endpoint with limit parameter", async () => {
      const mockInboxData = {
        items: [
          { id: "notif_123", subject: "Test Notification", content: "Test content" },
          { id: "notif_456", subject: "Another Notification", content: "More content" },
        ],
      };
      const limit = 20;

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockInboxData,
        error: null,
      });

      const result = await inboxMethods.getCurrentInbox({ limit });

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/inbox/current", {
        params: { query: { limit } },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInboxData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Invalid request format" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(inboxMethods.getCurrentInbox()).rejects.toThrow(
        "Failed to get current inbox: Invalid request format"
      );
    });
  });
});
