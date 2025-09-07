import type { Client } from "openapi-fetch";
import type { paths } from "./generated/schema";
import type { ServerPaths } from "./path-filters";
import { formatError } from "./utils";

type CreateKeyResponse =
  paths["/v1/auth/keys"]["post"]["responses"]["201"]["content"]["application/json"];

type CreateKeyRequest =
  paths["/v1/auth/keys"]["post"]["requestBody"]["content"]["application/json"];

export interface ServerAuthMethods {
  createKey(data: CreateKeyRequest): Promise<CreateKeyResponse>;
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
  };
};
