import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import RoomPageContainer from "./pages/room/RoomPageContainer.tsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/components/ui/breadcrumb.tsx";
import { Separator } from "@/shadcn/components/ui/separator.tsx";
import { AppSidebar } from "@/components/sidebar/AppSidebar.tsx";
import React, { useEffect } from "react";
import Piece from "@/pages/Piece.tsx";
import DummyPiece from "@/pages/DummyPiece.tsx";
import DummyRoom from "@/pages/DummyRoom.tsx";
import DebugStompPage from "@/pages/debug/DebugStompPage.tsx";
import { stompService } from "@/service/stompService.ts";
import { useMainStore } from "@/zustand/mainStore.ts";
import { useRoomsApi, useUsersApi } from "@/api/useAuthenticatedApiClient.ts";
import { useAuth } from "react-oidc-context";

export default function AppAuthenticated() {
  const {
    setConnected,
    setCurrentUser,
    addPiece,
    updatePiece,
    removePiece,
    addRoom,
    updateRoom,
    removeRoom,
  } = useMainStore();
  const usersApi = useUsersApi();
  const roomsApi = useRoomsApi();
  const auth = useAuth();

  // Initialize store with dummy data
  useEffect(() => {
    // Add dummy pieces
    addPiece({
      id: "1",
      title: "Piece 1",
      composer: "",
      difficulty: "",
      bpmRange: "",
      isPublic: false,
    });
    addPiece({
      id: "2",
      title: "Piece 2",
      composer: "",
      difficulty: "",
      bpmRange: "",
      isPublic: false,
    });
    addPiece({
      id: "3",
      title: "Piece 3",
      composer: "",
      difficulty: "",
      bpmRange: "",
      isPublic: false,
    });
    addPiece({
      id: "dummy",
      title: "Dummy Piece",
      composer: "",
      difficulty: "",
      bpmRange: "",
      isPublic: false,
    });

    // Add rooms
    addRoom({
      id: "dummy",
      title: "Dummy RoomPageContainer",
      ownerId: "00000000-0000-0000-0000-000000000000",
    });
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
  }, [addPiece, addRoom, roomsApi]);

  // Global subscriptions
  useEffect(() => {
    const generalHandlerId = stompService.addSubscription(
      "/topic/general",
      (event) => {
        console.log("General event:", event);
        switch (event.type) {
          case "piece-now-available":
            addPiece(event.payload.piece);
            break;
          case "piece-metadata-updated":
            updatePiece(event.payload.piece.id, event.payload.piece);
            break;
          case "piece-now-unavailable":
            removePiece(event.payload.pieceId);
            break;
          case "room-now-available":
            addRoom(event.payload.room);
            break;
          case "room-metadata-updated":
            updateRoom(event.payload.room.id, event.payload.room);
            break;
          case "room-now-unavailable":
            removeRoom(event.payload.roomId);
            break;
        }
      },
    );

    const userNotificationHandlerId = stompService.addSubscription(
      "/user/queue/notifications",
      (event) => {
        console.log("User notification:", event);

        switch (event.type) {
          case "error":
            console.error(
              "Server error:",
              event.payload.error,
              event.payload.message,
            );
            // TODO: Show error notification to user
            break;
          case "room-joined":
            console.log("Successfully joined room:", event.payload.room);
            // TODO: Navigate to room or update room state
            break;
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
  }, [addPiece, updatePiece, removePiece, addRoom, updateRoom, removeRoom]);

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
        onWebSocketError: (evt) => {
          console.log("WebSocket error:", evt);
          setConnected(false);
        },
        onWebSocketClose: (evt) => {
          console.log("WebSocket closed:", evt);
          setConnected(false);
        },
        onStompError: (evt) => {
          console.log("STOMP error:", evt);
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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Pages</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>A page</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms/dummy" element={<DummyRoom />} />
              <Route path="/rooms/:id" element={<RoomPageContainer />} />
              <Route path="/pieces/dummy" element={<DummyPiece />} />
              <Route path="/pieces/:id" element={<Piece />} />
              <Route path="/debug/stomp" element={<DebugStompPage />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
