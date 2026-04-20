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
import { toast } from "sonner";

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
        }).then((response: Response) => {
          if (response.status >= 400) {
            console.log("API request error:", response);
            if (response.status === 401) {
              toast.error(
                "Not authenticated. Assuming your session expired...",
              );
              void auth.signoutRedirect();
            } else if (response.status === 403) {
              toast.error("Access denied!");
            } else if (response.status === 404) {
              toast.warning("Resource not found.");
            } else if (response.status >= 500) {
              toast.error(
                "Internal Server Error. This shouldn't have happened.",
              );
            }
          }
          return response;
        });
      },
    });

    return new apiClass(config);
  }, [apiClass, auth]);
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
