import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { stompService } from "@/service/stompService.ts";
import { useRoomStore } from "@/zustand/roomStore.ts";
import { useRoomsApi } from "@/api/useAuthenticatedApiClient.ts";
import RoomPage from "./RoomPage";
import { Spinner } from "@/shadcn/components/ui/spinner.tsx";
import { ResponseError } from "@/api/generated/openapi";
import type { RoomEventDto } from "@/interfaces/async/EventDto.ts";
import { toast } from "sonner";

export default function RoomPageContainer() {
  const { id } = useParams();
  const [notFound, setNotFound] = useState(false);
  const { setRoom, reset, addChatMessage, initialLoadComplete } =
    useRoomStore();
  const roomsApi = useRoomsApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && initialLoadComplete && !notFound) {
      const subId = stompService.addSubscription(`/topic/room.${id}`, (evt) => {
        const event = evt as RoomEventDto;
        console.log(`Event for room ${id}:`, event);
        switch (event.type) {
          case "metadata-updated":
            setRoom(event.payload.room);
            break;
          case "chat-message":
            addChatMessage(event.payload);
            toast.message("New chat message!", {
              duration: 1500,
            });
            break;
          case "room-deleted":
            void navigate("/");
            toast.info("The room you were in has been deleted.");
            break;
          default:
            console.warn(`Unhandled event type ${event.type} for room ${id}`);
        }
      });

      return () => {
        stompService.removeSubscription(`/topic/room.${id}`, subId);
        reset();
      };
    }
  }, [
    id,
    addChatMessage,
    reset,
    setRoom,
    initialLoadComplete,
    notFound,
    navigate,
  ]);

  useEffect(() => {
    if (id) {
      roomsApi
        .getRoom({ id })
        .then((room) => {
          setRoom(room);
        })
        .catch((err: unknown) => {
          console.error(`Failed to fetch room ${id}:`, err);
          if (err instanceof ResponseError) {
            if (err.response.status === 404) {
              setNotFound(true);
            }
          }
        });
    }
  }, [id, setRoom, roomsApi, setNotFound]);

  if (notFound) {
    return <div>Room not found</div>;
  } else if (initialLoadComplete) {
    return <RoomPage />;
  } else {
    return <Spinner />;
  }
}
