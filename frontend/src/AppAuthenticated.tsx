import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import RoomPageContainer from "./pages/room/RoomPageContainer.tsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar.tsx";
import { Separator } from "@/shadcn/components/ui/separator.tsx";
import { AppSidebar } from "@/components/sidebar/AppSidebar.tsx";
import React, { useEffect } from "react";
import PiecePageContainer from "@/pages/piece/PiecePageContainer.tsx";
import DebugStompPage from "@/pages/debug/DebugStompPage.tsx";
import { stompService } from "@/service/stompService.ts";
import { useMainStore } from "@/zustand/mainStore.ts";
import {
  usePiecesApi,
  useRoomsApi,
  useUsersApi,
} from "@/api/useAuthenticatedApiClient.ts";
import { useAuth } from "react-oidc-context";
import { toast } from "sonner";
import AppBreadcrumbs from "@/components/navigation/AppBreadcrumbs.tsx";
import type {
  GeneralEventDto,
  UserEventDto,
} from "@/interfaces/async/EventDto.ts";
import NotFoundPage from "./pages/error/NotFoundPage.tsx";

const STOMP_CONNECTED_TOAST_ID = "stomp-connected";
const STOMP_DISCONNECTED_TOAST_ID = "stomp-disconnected";

export default function AppAuthenticated() {
  const setConnected = useMainStore((store) => store.setConnected);
  const setCurrentUser = useMainStore((store) => store.setCurrentUser);
  const addPiece = useMainStore((store) => store.addPiece);
  const addRoom = useMainStore((store) => store.addRoom);
  const applyGeneralEvent = useMainStore((store) => store.applyGeneralEvent);
  const connected = useMainStore((store) => store.connected);

  const usersApi = useUsersApi();
  const piecesApi = usePiecesApi();
  const roomsApi = useRoomsApi();
  const auth = useAuth();

  // Initialize store from API
  useEffect(() => {
    // Add pieces
    piecesApi
      .getPieces()
      .then((pieces) => {
        pieces.forEach((piece) => {
          addPiece(piece);
        });
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch pieces:", err);
      });

    // Add rooms
    roomsApi
      .getRooms()
      .then((rooms) => {
        rooms.forEach((room) => {
          addRoom(room);
        });
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch rooms:", err);
      });
  }, [addPiece, addRoom, piecesApi, roomsApi]);

  // Global subscriptions
  useEffect(() => {
    const generalHandlerId = stompService.addSubscription(
      "/topic/general",
      (event) => {
        console.log("General event:", event);
        applyGeneralEvent(event as GeneralEventDto);
      },
    );

    const userNotificationHandlerId = stompService.addSubscription(
      "/user/queue/notifications",
      (event) => {
        console.log("User notification:", event);
        event = event as UserEventDto;

        if (event.type === "error") {
          console.error(
            "Received error event:",
            event.payload.error,
            event.payload.message,
          );
          toast.error("Error: " + event.payload.error, {
            description: event.payload.message,
          });
        } else {
          applyGeneralEvent(event);
        }
      },
    );

    // Cleanup
    return () => {
      stompService.removeSubscription("/topic/general", generalHandlerId);
      stompService.removeSubscription(
        "/user/queue/notifications",
        userNotificationHandlerId,
      );
    };
  }, [addRoom, addPiece, applyGeneralEvent]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      console.log("Setting up WebSocket connection...");
      stompService.connect(auth.user.access_token, {
        onConnect: () => {
          setConnected(true);
        },
        onDisconnect: () => {
          setConnected(false);
        },
        onWebSocketError: () => {
          setConnected(false);
        },
        onWebSocketClose: () => {
          setConnected(false);
        },
        onStompError: () => {
          setConnected(false);
        },
      });

      // Cleanup function
      return () => {
        console.log("Cleaning up WebSocket connection...");
        void stompService.disconnect();
      };
    }
  }, [auth.isAuthenticated, auth.user?.access_token, setConnected]);

  // Call users API when authenticated (to ensure user exists in database)
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      usersApi
        .getCurrentUser()
        .then((user) => {
          console.log(user);
          setCurrentUser(user);
        })
        .catch((error: unknown) => {
          console.error("Failed to fetch current user:", error);
        });
    }
  }, [auth.isAuthenticated, auth.user?.access_token, usersApi, setCurrentUser]);

  // Show toast on connection state changes
  useEffect(() => {
    if (connected === false) {
      toast.dismiss(STOMP_CONNECTED_TOAST_ID);
      toast.error("Connection to realtime service lost!", {
        id: STOMP_DISCONNECTED_TOAST_ID,
        duration: Infinity,
      });
    } else if (connected) {
      toast.dismiss(STOMP_DISCONNECTED_TOAST_ID);
      toast.info("Connected to realtime service!", {
        id: STOMP_CONNECTED_TOAST_ID,
        duration: 2500,
      });
    }
  }, [connected]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6">
      <SidebarProvider
        className="flex"
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <AppBreadcrumbs />
          </header>
          <main className="flex-1 p-1 md:p-2 lg:p-3">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms/:id" element={<RoomPageContainer />} />
              <Route path="/pieces/:id" element={<PiecePageContainer />} />
              <Route path="/debug/stomp" element={<DebugStompPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
