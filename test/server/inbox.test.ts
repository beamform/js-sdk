import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServerPaths } from "../../src/path-filters";
import { createInboxMethods } from "../../src/server/inbox";

const mockClient = {
  GET: vi.fn(),
} as unknown as Client<ServerPaths>;

describe("server inbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInboxForRecipient", () => {
    const inboxMethods = createInboxMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const recipientId = "user_123";
      const limit = 20;
      const mockResponseData = {
        items: [
          {
            id: "ntf_EQy9R3G1q1uJFmWa3QgEde",
            type: "notification",
            subject: "Welcome to Beamform",
            content: "Your account has been successfully created. Welcome to our platform!",
            actions: [
              {
                title: "Get Started",
                link: "https://app.beamform.ai/onboarding?welcome=true&source=notification",
              },
            ],
            interest: 0.85,
            occurredAt: "2024-01-15T10:30:00Z",
            metadata: {
              campaign_id: "welcome_series",
              priority: "high",
              source: "onboarding",
              user_segment: "new_customer",
            },
          },
        ],
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await inboxMethods.getInboxForRecipient({
        recipient_id: recipientId,
        limit,
      });

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/inbox/recipients/{recipient_id}", {
        params: {
          path: { recipient_id: recipientId },
          query: { limit },
        },
      });
      expect(mockClient.GET).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should call correct endpoint without limit parameter", async () => {
      const recipientId = "user_123";
      const mockResponseData = {
        items: [
          {
            id: "ntf_EQy9R3G1q1uJFmWa3QgEde",
            type: "notification",
            subject: "Welcome to Beamform",
            content: "Your account has been successfully created.",
            interest: 0.85,
            occurredAt: "2024-01-15T10:30:00Z",
          },
        ],
      };

      mockClient.GET = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await inboxMethods.getInboxForRecipient({
        recipient_id: recipientId,
      });

      expect(mockClient.GET).toHaveBeenCalledWith("/v1/inbox/recipients/{recipient_id}", {
        params: {
          path: { recipient_id: recipientId },
          query: {},
        },
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
        inboxMethods.getInboxForRecipient({ recipient_id: "nonexistent" })
      ).rejects.toThrow("Failed to get inbox for recipient: Recipient not found");
    });
  });
});
