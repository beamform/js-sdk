import type { Client } from "openapi-fetch";
import type { paths } from "../generated/schema";
import type { ClientPaths } from "../path-filters";
import { formatError } from "../utils";

type CurrentSessionResponse =
  paths["/v1/auth/session/current"]["get"]["responses"]["200"]["content"]["application/json"];

type RefreshTokenResponse =
  paths["/v1/auth/tokens/refresh"]["post"]["responses"]["200"]["content"]["application/json"];

export interface AuthMethods {
  getCurrentSession(): Promise<CurrentSessionResponse>;
  deleteCurrentSession(): Promise<void>;
  refreshSessionToken(refreshToken: string): Promise<RefreshTokenResponse>;
}

export const createAuthMethods = (client: Client<ClientPaths>): AuthMethods => {
  return {
    async getCurrentSession(): Promise<CurrentSessionResponse> {
      const { data, error } = await client.GET("/v1/auth/session/current");

      if (error) {
        throw new Error(`Failed to get current session: ${formatError(error)}`);
      }

      return data;
    },

    async deleteCurrentSession(): Promise<void> {
      const { error } = await client.DELETE("/v1/auth/session/current");

      if (error) {
        throw new Error(`Failed to delete current session: ${formatError(error)}`);
      }
    },

    async refreshSessionToken(refreshToken: string): Promise<RefreshTokenResponse> {
      const { data, error } = await client.POST("/v1/auth/tokens/refresh", {
        body: { refreshToken },
      });

      if (error) {
        throw new Error(`Failed to refresh session token: ${formatError(error)}`);
      }

      return data;
    },
  };
};
