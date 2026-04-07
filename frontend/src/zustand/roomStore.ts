import { create } from "zustand";
import type {
  RoomDto,
  RoomMetadataDto,
  UserDto,
} from "@/api/generated/openapi";
import type ChatMessagePayload from "@/interfaces/async/payload/room/ChatMessagePayload.ts";

interface RoomStoreState {
  room: RoomDto;
  chatMessages: ChatMessagePayload[];
  initialLoadComplete: boolean;

  reset: () => void;
  setRoom: (room: RoomDto) => void;
  updateRoom: (roomMetadata: RoomMetadataDto) => void;
  addChatMessage: (message: ChatMessagePayload) => void;
  addJoinedUser: (user: UserDto) => void;
  removeJoinedUser: (userId: string) => UserDto | undefined;
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
  updateRoom: (roomMetadata) => {
    set((state) => ({
      room: {
        ...state.room,
        ...roomMetadata,
      },
    }));
  },
  addChatMessage: (message) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }));
  },
  addJoinedUser: (user) => {
    set((state) => ({
      room: {
        ...state.room,
        roomUsers: [...state.room.roomUsers, user],
      },
    }));
  },
  removeJoinedUser: (userId) => {
    const user = get().room.roomUsers.find((u) => u.id === userId);
    set((state) => ({
      room: {
        ...state.room,
        roomUsers: state.room.roomUsers.filter((u) => u.id !== userId),
      },
    }));
    return user;
  },
}));
