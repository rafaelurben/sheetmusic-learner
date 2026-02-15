import AppUnauthenticated from "@/AppUnauthenticated.tsx";
import { useAuth } from "react-oidc-context";
import AppAuthenticated from "@/AppAuthenticated.tsx";

export default function App() {
  const auth = useAuth();

  return auth.isAuthenticated ? <AppAuthenticated /> : <AppUnauthenticated />;
}
