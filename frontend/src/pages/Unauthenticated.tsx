import { useAuth } from "react-oidc-context";

export default function Unauthenticated() {
  const auth = useAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return (
      <div>
        Oops... {auth.error.source} caused {auth.error.message}
      </div>
    );
  }

  return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
}
