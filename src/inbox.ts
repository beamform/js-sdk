import type { Client } from "openapi-fetch";
import type { paths } from "./generated/schema";
import type { ClientPaths } from "./path-filters";
import { formatError } from "./utils";

type InboxResponse =
  paths["/v1/inbox/current"]["get"]["responses"]["200"]["content"]["application/json"];

type RecipientInboxResponse =
  paths["/v1/inbox/recipients/{recipient_id}"]["get"]["responses"]["200"]["content"]["application/json"];

export interface InboxMethods {
  getCurrentInbox(): Promise<InboxResponse>;
  getInboxForRecipient(recipientId: string): Promise<RecipientInboxResponse>;
}

export const createInboxMethods = (client: Client<ClientPaths>): InboxMethods => {
  return {
    async getCurrentInbox(): Promise<InboxResponse> {
      const { data, error } = await client.GET("/v1/inbox/current");

      if (error) {
        throw new Error(`Failed to get current inbox: ${formatError(error)}`);
      }

      return data;
    },

    async getInboxForRecipient(recipientId: string): Promise<RecipientInboxResponse> {
      const { data, error } = await client.GET("/v1/inbox/recipients/{recipient_id}", {
        params: { path: { recipient_id: recipientId } },
      });

      if (error) {
        throw new Error(`Failed to get inbox for recipient: ${formatError(error)}`);
      }

      return data;
    },
  };
};
