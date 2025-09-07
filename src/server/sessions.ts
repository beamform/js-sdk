import type { Client } from "openapi-fetch";
import type { paths } from "../generated/schema";
import type { ServerPaths } from "../path-filters";
import { formatError } from "../utils";

type CreateSessionResponse =
  paths["/v1/auth/recipients/{recipient_id}/sessions"]["post"]["responses"]["201"]["content"]["application/json"];

type CreateSessionRequest =
  paths["/v1/auth/recipients/{recipient_id}/sessions"]["post"]["requestBody"]["content"]["application/json"];

type CreateSessionParams =
  paths["/v1/auth/recipients/{recipient_id}/sessions"]["post"]["parameters"]["path"];

type ListSessionsResponse =
  paths["/v1/auth/recipients/{recipient_id}/sessions"]["get"]["responses"]["200"]["content"]["application/json"];

type ListSessionsParams =
  paths["/v1/auth/recipients/{recipient_id}/sessions"]["get"]["parameters"]["path"];

type GetSessionResponse =
  paths["/v1/auth/recipients/{recipient_id}/sessions/{session_id}"]["get"]["responses"]["200"]["content"]["application/json"];

type GetSessionParams =
  paths["/v1/auth/recipients/{recipient_id}/sessions/{session_id}"]["get"]["parameters"]["path"];

type DeleteSessionParams =
  paths["/v1/auth/recipients/{recipient_id}/sessions/{session_id}"]["delete"]["parameters"]["path"];

type DeleteAllSessionsParams =
  paths["/v1/auth/recipients/{recipient_id}/sessions"]["delete"]["parameters"]["path"];

export interface SessionMethods {
  createSession(
    params: CreateSessionParams & { data: CreateSessionRequest }
  ): Promise<CreateSessionResponse>;
  listSessions(params: ListSessionsParams): Promise<ListSessionsResponse>;
  getSession(params: GetSessionParams): Promise<GetSessionResponse>;
  deleteSession(params: DeleteSessionParams): Promise<void>;
  deleteAllSessions(params: DeleteAllSessionsParams): Promise<void>;
}

export const createSessionMethods = (client: Client<ServerPaths>): SessionMethods => {
  return {
    async createSession(
      params: CreateSessionParams & { data: CreateSessionRequest }
    ): Promise<CreateSessionResponse> {
      const { data, ...pathParams } = params;
      const { data: responseData, error } = await client.POST(
        "/v1/auth/recipients/{recipient_id}/sessions",
        {
          params: { path: pathParams },
          body: data,
        }
      );

      if (error) {
        throw new Error(`Failed to create session: ${formatError(error)}`);
      }

      return responseData;
    },

    async listSessions(params: ListSessionsParams): Promise<ListSessionsResponse> {
      const { data, error } = await client.GET("/v1/auth/recipients/{recipient_id}/sessions", {
        params: { path: params },
      });

      if (error) {
        throw new Error(`Failed to list sessions: ${formatError(error)}`);
      }

      return data;
    },

    async getSession(params: GetSessionParams): Promise<GetSessionResponse> {
      const { data, error } = await client.GET(
        "/v1/auth/recipients/{recipient_id}/sessions/{session_id}",
        {
          params: { path: params },
        }
      );

      if (error) {
        throw new Error(`Failed to get session: ${formatError(error)}`);
      }

      return data;
    },

    async deleteSession(params: DeleteSessionParams): Promise<void> {
      const { error } = await client.DELETE(
        "/v1/auth/recipients/{recipient_id}/sessions/{session_id}",
        {
          params: { path: params },
        }
      );

      if (error) {
        throw new Error(`Failed to delete session: ${formatError(error)}`);
      }
    },

    async deleteAllSessions(params: DeleteAllSessionsParams): Promise<void> {
      const { error } = await client.DELETE("/v1/auth/recipients/{recipient_id}/sessions", {
        params: { path: params },
      });

      if (error) {
        throw new Error(`Failed to delete all sessions: ${formatError(error)}`);
      }
    },
  };
};
