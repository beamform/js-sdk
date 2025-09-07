import type { Client } from "openapi-fetch";
import type { paths } from "../generated/schema";
import type { ServerPaths } from "../path-filters";
import { formatError } from "../utils";

type GetInboxForRecipientResponse =
  paths["/v1/inbox/recipients/{recipient_id}"]["get"]["responses"]["200"]["content"]["application/json"];

type GetInboxForRecipientParams =
  paths["/v1/inbox/recipients/{recipient_id}"]["get"]["parameters"]["path"];

type GetInboxForRecipientQuery =
  paths["/v1/inbox/recipients/{recipient_id}"]["get"]["parameters"]["query"];

export interface InboxMethods {
  getInboxForRecipient(
    params: GetInboxForRecipientParams & GetInboxForRecipientQuery
  ): Promise<GetInboxForRecipientResponse>;
}

export const createInboxMethods = (client: Client<ServerPaths>): InboxMethods => {
  return {
    async getInboxForRecipient(
      params: GetInboxForRecipientParams & GetInboxForRecipientQuery
    ): Promise<GetInboxForRecipientResponse> {
      const { recipient_id, ...queryParams } = params;
      const { data, error } = await client.GET("/v1/inbox/recipients/{recipient_id}", {
        params: {
          path: { recipient_id },
          query: queryParams,
        },
      });

      if (error) {
        throw new Error(`Failed to get inbox for recipient: ${formatError(error)}`);
      }

      return data;
    },
  };
};
