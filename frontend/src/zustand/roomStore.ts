import { create } from "zustand";
import type { RoomDto } from "@/api/generated/openapi";
import type { ChatMessageDto } from "@/interfaces/async/EventDto.ts";

interface RoomStoreState {
  room: RoomDto;
  chatMessages: ChatMessageDto[];
  initialLoadComplete: boolean;

  reset: () => void;
  setRoom: (room: RoomDto) => void;
  addChatMessage: (message: ChatMessageDto) => void;
}

const initialState = {
  room: {} as RoomDto,
  chatMessages: [] as ChatMessageDto[],
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
