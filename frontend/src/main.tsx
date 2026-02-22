import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { BrowserRouter } from "react-router-dom";
import { loadConfig } from "@/config";
import { TooltipProvider } from "@/shadcn/components/ui/tooltip.tsx";
import { WebStorageStateStore } from "oidc-client-ts";
import ErrorPage from "@/pages/ErrorPage.tsx";

async function bootstrap() {
  let appConfig: Awaited<ReturnType<typeof loadConfig>>;
  try {
    appConfig = await loadConfig();
  } catch (error) {
    console.error("Failed to load configuration:", error);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <ErrorPage
          title="Backend unavailable"
          description="Failed to load configuration. The system might be currently unavailable. Please try again later."
        />
      </StrictMode>,
    );
    return;
  }

  const oidcConfig: AuthProviderProps = {
    authority: appConfig.oidc.issuer.replace(
      "http://host.docker.internal:",
      "http://localhost:",
    ),
    client_id: appConfig.oidc.clientId,
    scope: appConfig.oidc.scope,
    redirect_uri: globalThis.location.origin,
    onSigninCallback: () => {
      globalThis.history.replaceState({}, document.title, "/");
    },
    userStore: new WebStorageStateStore({ store: globalThis.localStorage }),
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthProvider {...oidcConfig}>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </StrictMode>,
  );
}

await bootstrap();
