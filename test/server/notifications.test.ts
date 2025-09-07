import type { Client } from "openapi-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServerPaths } from "../../src/path-filters";
import { createNotificationMethods } from "../../src/server/notifications";

const mockClient = {
  POST: vi.fn(),
  DELETE: vi.fn(),
} as unknown as Client<ServerPaths>;

describe("server notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification", () => {
    const notificationMethods = createNotificationMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const requestData = {
        subject: "Test Notification",
        content: "This is a test notification",
        recipients: ["user_123"],
      };
      const mockResponseData = {
        id: "ntf_123",
      };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await notificationMethods.createNotification({ data: requestData });

      expect(mockClient.POST).toHaveBeenCalledWith("/v1/notifications", {
        body: requestData,
        params: { header: {} },
      });
      expect(mockClient.POST).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should include idempotency key in headers when provided", async () => {
      const requestData = {
        subject: "Test Notification",
        content: "This is a test notification",
        recipients: ["user_123"],
      };
      const idempotencyKey = "550e8400-e29b-41d4-a716-446655440000";
      const mockResponseData = { id: "ntf_123" };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await notificationMethods.createNotification({
        data: requestData,
        idempotencyKey,
      });

      expect(mockClient.POST).toHaveBeenCalledWith("/v1/notifications", {
        body: requestData,
        params: { header: { "Idempotency-Key": idempotencyKey } },
      });
      expect(mockClient.POST).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Invalid recipients" };

      mockClient.POST = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(
        notificationMethods.createNotification({
          data: {
            subject: "Test",
            content: "Test body",
            recipients: ["invalid"],
          },
        })
      ).rejects.toThrow("Failed to create notification: Invalid recipients");
    });
  });

  describe("deleteNotification", () => {
    const notificationMethods = createNotificationMethods(mockClient);

    it("should call correct endpoint and return data on success", async () => {
      const notificationId = "ntf_123";
      const mockResponseData = {
        id: "ntf_123",
      };

      mockClient.DELETE = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await notificationMethods.deleteNotification({ id: notificationId });

      expect(mockClient.DELETE).toHaveBeenCalledWith("/v1/notifications/{id}", {
        params: {
          path: { id: notificationId },
          header: {},
        },
      });
      expect(mockClient.DELETE).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should include idempotency key in headers when provided", async () => {
      const notificationId = "ntf_123";
      const idempotencyKey = "550e8400-e29b-41d4-a716-446655440000";
      const mockResponseData = { id: "ntf_123" };

      mockClient.DELETE = vi.fn().mockResolvedValue({
        data: mockResponseData,
        error: null,
      });

      const result = await notificationMethods.deleteNotification({
        id: notificationId,
        idempotencyKey,
      });

      expect(mockClient.DELETE).toHaveBeenCalledWith("/v1/notifications/{id}", {
        params: {
          path: { id: notificationId },
          header: { "Idempotency-Key": idempotencyKey },
        },
      });
      expect(mockClient.DELETE).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw formatted error when API returns error", async () => {
      const apiError = { message: "Notification not found" };

      mockClient.DELETE = vi.fn().mockResolvedValue({
        data: null,
        error: apiError,
      });

      await expect(notificationMethods.deleteNotification({ id: "nonexistent" })).rejects.toThrow(
        "Failed to delete notification: Notification not found"
      );
    });
  });
});
