import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { BrowserRouter } from "react-router-dom";
import { loadConfig } from "@/config";
import { TooltipProvider } from "@/shadcn/components/ui/tooltip.tsx";
import { WebStorageStateStore } from "oidc-client-ts";

async function bootstrap() {
  const appConfig = await loadConfig();

  const oidcConfig: AuthProviderProps = {
    authority: appConfig.oidc.issuer,
    client_id: appConfig.oidc.clientId,
    scope: appConfig.oidc.scope,
    redirect_uri: window.location.origin,
    onSigninCallback: () => {
      window.history.replaceState({}, document.title, "/");
    },
    userStore: new WebStorageStateStore({ store: window.localStorage }),
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
