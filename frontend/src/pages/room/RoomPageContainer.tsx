import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { stompService } from "@/service/stompService.ts";
import { useRoomStore } from "@/zustand/roomStore.ts";
import { useRoomsApi } from "@/api/useAuthenticatedApiClient.ts";
import RoomPage from "./RoomPage";
import { Spinner } from "@/shadcn/components/ui/spinner.tsx";
import { ResponseError } from "@/api/generated/openapi";

export default function RoomPageContainer() {
  const { id } = useParams();
  const [notFound, setNotFound] = useState(false);
  const { setRoom, reset, addChatMessage, initialLoadComplete } =
    useRoomStore();
  const roomsApi = useRoomsApi();

  useEffect(() => {
    if (id) {
      const subId = stompService.addSubscription(
        `/topic/room.${id}`,
        (event) => {
          console.log(`Event for room ${id}:`, event);
          switch (event.type) {
            case "chat-message":
              addChatMessage(event.payload);
              break;
            default:
              console.warn(`Unhandled event type ${event.type} for room ${id}`);
          }
        },
      );

      return () => {
        stompService.removeSubscription(`/topic/room.${id}`, subId);
        reset();
      };
    }
  }, [id, addChatMessage, reset]);

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
