import AppUnauthenticated from "@/AppUnauthenticated.tsx";
import { useAuth } from "react-oidc-context";
import AppAuthenticated from "@/AppAuthenticated.tsx";

import { MainStoreProvider } from "@/zustand/main/mainStoreProvider.tsx";

export default function App() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return (
      <MainStoreProvider
        pieces={{
          1: {
            id: "1",
            title: "Piece 1",
          },
          2: {
            id: "2",
            title: "Piece 2",
          },
          3: {
            id: "3",
            title: "Piece 3",
          },
          dummy: {
            id: "dummy",
            title: "Dummy Piece",
          },
        }}
        rooms={{
          1: {
            id: "1",
            title: "Room 1",
          },
          2: {
            id: "2",
            title: "Room 2",
          },
          3: {
            id: "3",
            title: "Room 3",
          },
          dummy: {
            id: "dummy",
            title: "Dummy Room",
          },
        }}
      >
        <AppAuthenticated />
      </MainStoreProvider>
    );
  }

  return <AppUnauthenticated />;
}
