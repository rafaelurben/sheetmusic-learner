import AppUnauthenticated from "@/AppUnauthenticated.tsx";
import { useAuth } from "react-oidc-context";
import AppAuthenticated from "@/AppAuthenticated.tsx";

import { MainStoreProvider } from "@/zustand/main/mainStoreProvider.tsx";
import { useEffect } from "react";
import { stompService } from "@/service/stompService.ts";
import { useWebsocketStore } from "@/zustand/websocket/websocketStore.ts";

export default function App() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      console.log("Connecting to WebSocket...");
      stompService.connect(auth.user.access_token, {
        onConnect: () => {
          console.log("WebSocket connected");
          useWebsocketStore.getState().setConnected(true);
          stompService.subscribe("/topic/general", (message) => {
            const parsed: unknown = JSON.parse(message.body);
            useWebsocketStore.getState().addMessage("/topic/general", parsed);
          });
        },
        onStompError: (frame) => {
          console.error("STOMP Error:", frame);
        },
      });
    } else if (!auth.isAuthenticated) {
      void stompService.disconnect();
    }
  }, [auth.isAuthenticated, auth.user?.access_token]);

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
