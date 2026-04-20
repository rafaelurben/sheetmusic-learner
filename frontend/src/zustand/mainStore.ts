/*
 * (C) 2026. - Rafael Urben
 */
import { create } from "zustand";
import type {
  PieceMetadataDto,
  RoomMetadataDto,
  UserDto,
} from "@/api/generated/openapi";
import type { GeneralEventDto } from "@/interfaces/async/EventDto.ts";

export interface MainStoreState {
  connected: boolean | null;
  audioContextReady: boolean;
  rooms: Record<string, RoomMetadataDto>;
  pieces: Record<string, PieceMetadataDto>;
  currentUser: UserDto | null;

  setConnected: (value: boolean) => void;
  setAudioContextReady: (value: boolean) => void;
  setCurrentUser: (user: UserDto) => void;

  addRoom: (room: RoomMetadataDto) => void;
  removeRoom: (roomId: string) => void;
  addPiece: (piece: PieceMetadataDto) => void;
  removePiece: (pieceId: string) => void;

  applyGeneralEvent: (event: GeneralEventDto) => void;
}

export const useMainStore = create<MainStoreState>((set) => ({
  rooms: {},
  pieces: {},
  connected: null,
  audioContextReady: false,
  currentUser: null,
  setConnected: (value) => {
    set({ connected: value });
  },
  setAudioContextReady: (value) => {
    set({ audioContextReady: value });
  },
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },
  addRoom: (room: RoomMetadataDto) => {
    set((state) => ({
      rooms: {
        ...state.rooms,
        [room.id]: room,
      },
    }));
  },
  removeRoom: (roomId: string) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [roomId]: _, ...remainingRooms } = state.rooms;
      return { rooms: remainingRooms };
    });
  },
  addPiece: (piece: PieceMetadataDto) => {
    set((state) => ({
      pieces: {
        ...state.pieces,
        [piece.id]: piece,
      },
    }));
  },
  removePiece: (pieceId: string) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [pieceId]: _, ...remainingPieces } = state.pieces;
      return { pieces: remainingPieces };
    });
  },
  applyGeneralEvent: (event) => {
    switch (event.type) {
      case "piece-now-available":
      case "piece-metadata-updated":
        set((state) => ({
          pieces: {
            ...state.pieces,
            [event.payload.piece.id]: event.payload.piece,
          },
        }));
        return;
      case "piece-now-unavailable":
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [event.payload.pieceId]: _, ...remainingPieces } =
            state.pieces;
          return { pieces: remainingPieces };
        });
        return;
      case "room-now-available":
      case "room-metadata-updated":
        set((state) => ({
          rooms: {
            ...state.rooms,
            [event.payload.room.id]: event.payload.room,
          },
        }));
        return;
      case "room-now-unavailable":
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [event.payload.roomId]: _, ...remainingRooms } = state.rooms;
          return { rooms: remainingRooms };
        });
        return;
    }
  },
}));
