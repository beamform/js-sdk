import type { Client } from "openapi-fetch";
import type { paths } from "../generated/schema";
import type { ServerPaths } from "../path-filters";
import { formatError } from "../utils";

type CreateNotificationResponse =
  paths["/v1/notifications"]["post"]["responses"]["202"]["content"]["application/json"];

type CreateNotificationRequest =
  paths["/v1/notifications"]["post"]["requestBody"]["content"]["application/json"];

type CreateNotificationHeaders = paths["/v1/notifications"]["post"]["parameters"]["header"];

type DeleteNotificationResponse =
  paths["/v1/notifications/{id}"]["delete"]["responses"]["202"]["content"]["application/json"];

type DeleteNotificationParams = paths["/v1/notifications/{id}"]["delete"]["parameters"]["path"];

type DeleteNotificationHeaders = paths["/v1/notifications/{id}"]["delete"]["parameters"]["header"];

export interface NotificationMethods {
  createNotification(params: {
    data: CreateNotificationRequest;
    idempotencyKey?: string;
  }): Promise<CreateNotificationResponse>;
  deleteNotification(
    params: DeleteNotificationParams & {
      idempotencyKey?: string;
    }
  ): Promise<DeleteNotificationResponse>;
}

export const createNotificationMethods = (client: Client<ServerPaths>): NotificationMethods => {
  return {
    async createNotification(params: {
      data: CreateNotificationRequest;
      idempotencyKey?: string;
    }): Promise<CreateNotificationResponse> {
      const headers: CreateNotificationHeaders = {};
      if (params.idempotencyKey) {
        headers["Idempotency-Key"] = params.idempotencyKey;
      }

      const { data: responseData, error } = await client.POST("/v1/notifications", {
        body: params.data,
        params: { header: headers },
      });

      if (error) {
        throw new Error(`Failed to create notification: ${formatError(error)}`);
      }

      return responseData;
    },

    async deleteNotification(
      params: DeleteNotificationParams & {
        idempotencyKey?: string;
      }
    ): Promise<DeleteNotificationResponse> {
      const { idempotencyKey, ...pathParams } = params;
      const headers: DeleteNotificationHeaders = {};
      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }

      const { data, error } = await client.DELETE("/v1/notifications/{id}", {
        params: {
          path: pathParams,
          header: headers,
        },
      });

      if (error) {
        throw new Error(`Failed to delete notification: ${formatError(error)}`);
      }

      return data;
    },
  };
};
