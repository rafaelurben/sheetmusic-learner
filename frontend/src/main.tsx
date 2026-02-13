import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { BrowserRouter } from "react-router-dom";
import { loadConfig } from "@/config";

async function bootstrap() {
  let appConfig = await loadConfig();

  const oidcConfig: AuthProviderProps = {
    authority: appConfig.oidc.issuer,
    client_id: appConfig.oidc.clientId,
    scope: appConfig.oidc.scope,
    redirect_uri: window.location.origin,
    onSigninCallback: () =>
      window.history.replaceState({}, document.title, "/"),
  };

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthProvider {...oidcConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>,
  );
}

bootstrap().then();
