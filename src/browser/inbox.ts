import type { Client } from "openapi-fetch";
import type { paths } from "../generated/schema";
import type { ClientPaths } from "../path-filters";
import { formatError } from "../utils";

type InboxResponse =
  paths["/v1/inbox/current"]["get"]["responses"]["200"]["content"]["application/json"];

type InboxQuery = paths["/v1/inbox/current"]["get"]["parameters"]["query"];

export interface InboxMethods {
  getCurrentInbox(params?: InboxQuery): Promise<InboxResponse>;
}

export const createInboxMethods = (client: Client<ClientPaths>): InboxMethods => {
  return {
    async getCurrentInbox(params?: InboxQuery): Promise<InboxResponse> {
      // Filter out undefined query parameters
      const cleanQueryParams = params
        ? Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined))
        : {};

      const { data, error } = await client.GET("/v1/inbox/current", {
        params: { query: cleanQueryParams },
      });

      if (error) {
        throw new Error(`Failed to get current inbox: ${formatError(error)}`);
      }

      return data;
    },
  };
};
