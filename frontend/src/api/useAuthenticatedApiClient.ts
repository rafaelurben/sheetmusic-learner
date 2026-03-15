/*
 * (C) 2026. - Rafael Urben
 */

import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import {
  BaseAPI,
  Configuration,
  PiecesApi,
  RoomsApi,
  UsersApi,
} from "@/api/generated/openapi";

function useAuthenticatedApiClient<T extends BaseAPI>(
  apiClass: new (config: Configuration) => T,
): T {
  const auth = useAuth();

  return useMemo(() => {
    const config = new Configuration({
      basePath: globalThis.location.origin,
      fetchApi: async (input, init) => {
        const token = auth.user?.access_token;

        return fetch(input, {
          ...init,
          headers: {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...init?.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
      },
    });

    return new apiClass(config);
  }, [apiClass, auth.user?.access_token]);
}

export function useUsersApi() {
  return useAuthenticatedApiClient(UsersApi);
}

export function usePiecesApi() {
  return useAuthenticatedApiClient(PiecesApi);
}

export function useRoomsApi() {
  return useAuthenticatedApiClient(RoomsApi);
}
