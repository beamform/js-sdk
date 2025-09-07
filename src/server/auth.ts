import type { Client } from "openapi-fetch";
import type { paths } from "../generated/schema";
import type { ServerPaths } from "../path-filters";
import { formatError } from "../utils";

type CreateKeyResponse =
  paths["/v1/auth/keys"]["post"]["responses"]["201"]["content"]["application/json"];

type CreateKeyRequest =
  paths["/v1/auth/keys"]["post"]["requestBody"]["content"]["application/json"];

type ListKeysResponse =
  paths["/v1/auth/keys"]["get"]["responses"]["200"]["content"]["application/json"];

export interface ServerAuthMethods {
  createKey(data: CreateKeyRequest): Promise<CreateKeyResponse>;
  listKeys(cursor?: string | null, pageSize?: number): Promise<ListKeysResponse>;
}

export const createServerAuthMethods = (client: Client<ServerPaths>): ServerAuthMethods => {
  return {
    async createKey(data: CreateKeyRequest): Promise<CreateKeyResponse> {
      const { data: responseData, error } = await client.POST("/v1/auth/keys", {
        body: data,
      });

      if (error) {
        throw new Error(`Failed to create key: ${formatError(error)}`);
      }

      return responseData;
    },

    async listKeys(cursor?: string | null, pageSize?: number): Promise<ListKeysResponse> {
      const { data, error } = await client.GET("/v1/auth/keys", {
        params: { 
          path: { 
            cursor: cursor ?? null, 
            pageSize: pageSize ?? 20 
          } 
        },
      });

      if (error) {
        throw new Error(`Failed to list keys: ${formatError(error)}`);
      }

      return data;
    },
  };
};
