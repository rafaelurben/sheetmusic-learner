import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { stompService } from "@/service/stompService.ts";
import { useRoomStore } from "@/zustand/roomStore.ts";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { usePiecesApi, useRoomsApi } from "@/api/useAuthenticatedApiClient.ts";
import RoomPage from "./RoomPage";
import { Spinner } from "@/shadcn/components/ui/spinner.tsx";
import { ResponseError } from "@/api/generated/openapi";
import type {
  PieceEventDto,
  RoomEventDto,
} from "@/interfaces/async/EventDto.ts";
import { toast } from "sonner";

import { usePageTitle } from "@/zustand/pageTitleStore.ts";
import { useMainStore } from "@/zustand/mainStore.ts";
import type { SubscribeDestinationName } from "@/interfaces/async/helpers/SubscribeDestinationName.ts";
import ErrorPage from "@/pages/error/ErrorPage.tsx";
import ForbiddenPage from "@/pages/error/ForbiddenPage.tsx";

export default function RoomPageContainer() {
  const { id } = useParams();
  const [notFound, setNotFound] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const connected = useMainStore((state) => state.connected);
  const roomFromMainStore = useMainStore((state) =>
    id ? state.rooms[id] : undefined,
  );
  const currentUserId = useMainStore((state) => state.currentUser?.id);
  const {
    room,
    setRoom,
    reset: resetRoomStore,
    initialLoadComplete,
    applyRoomEvent,
  } = useRoomStore();
  const { setPiece, reset: resetPieceStore, applyPieceEvent } = usePieceStore();
  const roomsApi = useRoomsApi();
  const piecesApi = usePiecesApi();
  const navigate = useNavigate();

  usePageTitle(roomFromMainStore?.title ?? "Unknown room");

  // Async room store sub
  useEffect(() => {
    if (id && initialLoadComplete && !notFound) {
      const subId = stompService.addSubscription(`/topic/room.${id}`, (evt) => {
        const event = evt as RoomEventDto;
        console.log(`Event for room ${id}:`, event);

        const handlingResult = applyRoomEvent(event);
        if (!handlingResult) {
          return;
        }

        switch (handlingResult.type) {
          case "chat-message":
            if (handlingResult.senderId !== currentUserId) {
              toast.message("New chat message!", {
                duration: 1500,
              });
            }
            break;
          case "user-joined":
            toast.info(
              `${handlingResult.userFullName || "A user"} joined the room.`,
            );
            break;
          case "user-left":
            toast.info(
              `${handlingResult.userFullName || "A user"} left the room.`,
            );
            break;
          case "room-deleted":
            void navigate("/");
            toast.info("The room you were in has been deleted.");
            break;
          default:
            console.warn(`Unhandled event type ${event.type} for room ${id}`);
            break;
        }
      });

      return () => {
        stompService.removeSubscription(`/topic/room.${id}`, subId);
        resetRoomStore();
        resetPieceStore();
      };
    }
  }, [
    id,
    initialLoadComplete,
    notFound,
    currentUserId,
    navigate,
    resetRoomStore,
    resetPieceStore,
    applyRoomEvent,
  ]);

  // Sync room API
  useEffect(() => {
    if (id) {
      roomsApi
        .getRoom({ id })
        .then((room) => {
          setRoom(room);
          setNotFound(false);
        })
        .catch((err: unknown) => {
          console.error(`Failed to fetch room ${id}:`, err);
          if (err instanceof ResponseError) {
            if (err.response.status === 404) {
              setNotFound(true);
            } else if (err.response.status === 403) {
              setNotAllowed(true);
            }
          }
        });
    }
  }, [id, setRoom, roomsApi, connected]); // refresh on connected change

  // Sync Piece API
  useEffect(() => {
    if (!initialLoadComplete || notFound) {
      return;
    }

    if (!room.pieceId) {
      resetPieceStore();
      return;
    }

    const pieceId = room.pieceId;

    piecesApi
      .getPiece({ id: pieceId })
      .then((piece) => {
        setPiece(piece);
      })
      .catch((err: unknown) => {
        console.error(`Failed to fetch piece ${pieceId}:`, err);
        resetPieceStore();
      });
  }, [
    initialLoadComplete,
    notFound,
    room.pieceId,
    piecesApi,
    setPiece,
    resetPieceStore,
    connected, // refresh on connected change
  ]);

  // Async piece store sub
  useEffect(() => {
    if (!initialLoadComplete || notFound || !room.pieceId) {
      return;
    }

    const pieceId = room.pieceId;
    const pieceTopic =
      `/topic/piece.${pieceId}` satisfies SubscribeDestinationName;
    const subId = stompService.addSubscription(pieceTopic, (evt) => {
      const event = evt as PieceEventDto;
      console.log(`Event for piece ${pieceId}:`, event);

      applyPieceEvent(event);

      if (event.type === "piece-deleted") {
        toast.info("The piece shown in this room has been deleted.");
      }
    });

    return () => {
      stompService.removeSubscription(pieceTopic, subId);
      resetPieceStore();
    };
  }, [
    initialLoadComplete,
    notFound,
    room.pieceId,
    applyPieceEvent,
    resetPieceStore,
  ]);

  if (notFound) {
    return (
      <ErrorPage
        title="Room not found"
        description="This room was not found."
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        action={() => navigate("/")}
      />
    );
  } else if (notAllowed) {
    return <ForbiddenPage />;
  } else if (initialLoadComplete) {
    return <RoomPage />;
  } else {
    return <Spinner />;
  }
}
