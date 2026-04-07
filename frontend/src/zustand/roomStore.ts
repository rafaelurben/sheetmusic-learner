import { create } from "zustand";
import type { RoomDto } from "@/api/generated/openapi";
import type ChatMessagePayload from "@/interfaces/async/payload/room/ChatMessagePayload.ts";
import type { RoomEventDto } from "@/interfaces/async/EventDto.ts";

type RoomEventHandlingResult =
  | { type: "chat-message"; senderId: string }
  | { type: "user-joined"; userFullName: string }
  | { type: "user-left"; userFullName: string }
  | { type: "room-deleted" }
  | null;

interface RoomStoreState {
  room: RoomDto;
  chatMessages: ChatMessagePayload[];
  initialLoadComplete: boolean;

  reset: () => void;
  setRoom: (room: RoomDto) => void;

  applyRoomEvent: (event: RoomEventDto) => RoomEventHandlingResult;
}

const initialState = {
  room: {} as RoomDto,
  chatMessages: [] as ChatMessagePayload[],
  initialLoadComplete: false,
};

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  ...initialState,
  reset: () => {
    set(initialState);
  },
  setRoom: (room) => {
    set({ room, initialLoadComplete: true });
  },
  applyRoomEvent: (event) => {
    switch (event.type) {
      case "metadata-updated":
        set((state) => ({
          room: {
            ...state.room,
            ...event.payload.room,
          },
        }));
        return null;
      case "piece-changed":
        set((state) => ({
          room: {
            ...state.room,
            pieceId: event.payload.pieceId,
          },
        }));
        return null;
      case "chat-message":
        set((state) => ({
          chatMessages: [...state.chatMessages, event.payload],
        }));
        return { type: "chat-message", senderId: event.payload.sender.id };
      case "user-joined": {
        const user = event.payload.user;
        set((state) => ({
          room: {
            ...state.room,
            roomUsers: [...state.room.roomUsers, user],
          },
        }));
        return {
          type: "user-joined",
          userFullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        };
      }
      case "user-left": {
        const user = get().room.roomUsers.find(
          (u) => u.id === event.payload.userId,
        );
        set((state) => ({
          room: {
            ...state.room,
            roomUsers: state.room.roomUsers.filter(
              (u) => u.id !== event.payload.userId,
            ),
          },
        }));
        return {
          type: "user-left",
          userFullName: user
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "",
        };
      }
      case "room-deleted":
        return { type: "room-deleted" };
      default:
        return null;
    }
  },
}));
