import { create } from "zustand";
import type { RoomDto } from "@/api/generated/openapi";
import type ChatMessagePayload from "@/interfaces/async/payload/room/ChatMessagePayload.ts";

interface RoomStoreState {
  room: RoomDto;
  chatMessages: ChatMessagePayload[];
  initialLoadComplete: boolean;

  reset: () => void;
  setRoom: (room: RoomDto) => void;
  addChatMessage: (message: ChatMessagePayload) => void;
}

const initialState = {
  room: {} as RoomDto,
  chatMessages: [] as ChatMessagePayload[],
  initialLoadComplete: false,
};

export const useRoomStore = create<RoomStoreState>((set) => ({
  ...initialState,
  reset: () => {
    set(initialState);
  },
  setRoom: (room) => {
    set({ room, initialLoadComplete: true });
  },
  addChatMessage: (message) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }));
  },
}));
