import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInboxMethods } from "../../src/inbox";
import type { ClientPaths } from "../../src/path-filters";

// Mock client
const mockClient = {
  GET: vi.fn(),
} as unknown as Client<ClientPaths>;

describe("inbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentInbox", () => {
    const inboxMethods = createInboxMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const mockInboxData = { items: [{ id: "notif_123" }] };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockInboxData,
        error: null,
      });

      const result = await inboxMethods.getCurrentInbox();

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/inbox/current");
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

  describe("getInboxForRecipient", () => {
    const inboxMethods = createInboxMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const mockInboxData = { items: [{ id: "notif_456" }] };
      const recipientId = "user_123";

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockInboxData,
        error: null,
      });

      const result = await inboxMethods.getInboxForRecipient(recipientId);

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/inbox/recipients/{recipient_id}", {
        params: { path: { recipient_id: recipientId } },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInboxData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Recipient not found" };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(inboxMethods.getInboxForRecipient("user_123")).rejects.toThrow(
        "Failed to get inbox for recipient: Recipient not found"
      );
    });
  });
});
