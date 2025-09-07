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

type ListKeysParams = paths["/v1/auth/keys"]["get"]["parameters"]["path"];

type GetKeyResponse =
  paths["/v1/auth/keys/{key_id}"]["get"]["responses"]["200"]["content"]["application/json"];

type GetKeyParams = paths["/v1/auth/keys/{key_id}"]["get"]["parameters"]["path"];

type UpdateKeyRequest =
  paths["/v1/auth/keys/{key_id}"]["patch"]["requestBody"]["content"]["application/json"];

type UpdateKeyParams = paths["/v1/auth/keys/{key_id}"]["patch"]["parameters"]["path"];

type CheckPermissionResponse =
  paths["/v1/auth/keys/{key_id}/check"]["get"]["responses"]["200"]["content"]["application/json"];

type CheckPermissionParams = paths["/v1/auth/keys/{key_id}/check"]["get"]["parameters"]["path"];

type CheckPermissionQuery = paths["/v1/auth/keys/{key_id}/check"]["get"]["parameters"]["query"];

type ReplaceKeyRequest =
  paths["/v1/auth/keys/{key_id}"]["put"]["requestBody"]["content"]["application/json"];

type ReplaceKeyParams = paths["/v1/auth/keys/{key_id}"]["put"]["parameters"]["path"];

type DeleteKeyParams = paths["/v1/auth/keys/{key_id}"]["delete"]["parameters"]["path"];

export interface AuthMethods {
  createKey(params: { data: CreateKeyRequest }): Promise<CreateKeyResponse>;
  listKeys(params?: ListKeysParams): Promise<ListKeysResponse>;
  getKey(params: GetKeyParams): Promise<GetKeyResponse>;
  updateKey(params: UpdateKeyParams & { data: UpdateKeyRequest }): Promise<void>;
  replaceKey(params: ReplaceKeyParams & { data: ReplaceKeyRequest }): Promise<void>;
  deleteKey(params: DeleteKeyParams): Promise<void>;
  checkPermission(
    params: CheckPermissionParams & CheckPermissionQuery
  ): Promise<CheckPermissionResponse>;
}

export const createAuthMethods = (client: Client<ServerPaths>): AuthMethods => {
  return {
    async createKey(params: { data: CreateKeyRequest }): Promise<CreateKeyResponse> {
      const { data: responseData, error } = await client.POST("/v1/auth/keys", {
        body: params.data,
      });

      if (error) {
        throw new Error(`Failed to create key: ${formatError(error)}`);
      }

      return responseData;
    },

    async listKeys(params?: ListKeysParams): Promise<ListKeysResponse> {
      const { data, error } = await client.GET("/v1/auth/keys", {
        params: {
          path: {
            cursor: params?.cursor ?? null,
            pageSize: params?.pageSize ?? 20,
          },
        },
      });

      if (error) {
        throw new Error(`Failed to list keys: ${formatError(error)}`);
      }

      return data;
    },

    async getKey(params: GetKeyParams): Promise<GetKeyResponse> {
      const { data, error } = await client.GET("/v1/auth/keys/{key_id}", {
        params: { path: params },
      });

      if (error) {
        throw new Error(`Failed to get key: ${formatError(error)}`);
      }

      return data;
    },

    async updateKey(params: UpdateKeyParams & { data: UpdateKeyRequest }): Promise<void> {
      const { data, ...pathParams } = params;
      const { error } = await client.PATCH("/v1/auth/keys/{key_id}", {
        params: { path: pathParams },
        body: data,
      });

      if (error) {
        throw new Error(`Failed to update key: ${formatError(error)}`);
      }
    },

    async replaceKey(params: ReplaceKeyParams & { data: ReplaceKeyRequest }): Promise<void> {
      const { data, ...pathParams } = params;
      const { error } = await client.PUT("/v1/auth/keys/{key_id}", {
        params: { path: pathParams },
        body: data,
      });

      if (error) {
        throw new Error(`Failed to replace key: ${formatError(error)}`);
      }
    },

    async deleteKey(params: DeleteKeyParams): Promise<void> {
      const { error } = await client.DELETE("/v1/auth/keys/{key_id}", {
        params: { path: params },
      });

      if (error) {
        throw new Error(`Failed to delete key: ${formatError(error)}`);
      }
    },

    async checkPermission(
      params: CheckPermissionParams & CheckPermissionQuery
    ): Promise<CheckPermissionResponse> {
      const { key_id, permission } = params;
      const { data, error } = await client.GET("/v1/auth/keys/{key_id}/check", {
        params: {
          path: { key_id },
          query: { permission },
        },
      });

      if (error) {
        throw new Error(`Failed to check permission: ${formatError(error)}`);
      }

      return data;
    },
  };
};
