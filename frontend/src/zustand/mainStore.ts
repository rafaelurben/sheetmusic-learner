/*
 * (C) 2026. - Rafael Urben
 */
import { create } from "zustand";
import type {
  PieceMetadataDto,
  RoomMetadataDto,
  UserDto,
} from "@/api/generated/openapi";

export interface MainStoreState {
  connected: boolean | null;
  rooms: Record<string, RoomMetadataDto>;
  pieces: Record<string, PieceMetadataDto>;
  currentUser: UserDto | null;

  setConnected: (value: boolean) => void;
  setCurrentUser: (user: UserDto) => void;
  addRoom: (room: RoomMetadataDto) => void;
  updateRoom: (roomId: string, room: RoomMetadataDto) => void;
  removeRoom: (roomId: string) => void;
  addPiece: (piece: PieceMetadataDto) => void;
  updatePiece: (pieceId: string, piece: PieceMetadataDto) => void;
  removePiece: (pieceId: string) => void;
}

export const useMainStore = create<MainStoreState>((set) => ({
  rooms: {},
  pieces: {},
  connected: null,
  currentUser: null,
  setConnected: (value) => {
    set({ connected: value });
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
  updateRoom: (roomId: string, room: RoomMetadataDto) => {
    set((state) => ({
      rooms: {
        ...state.rooms,
        [roomId]: room,
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
  updatePiece: (pieceId: string, piece: PieceMetadataDto) => {
    set((state) => ({
      pieces: {
        ...state.pieces,
        [pieceId]: piece,
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
}));
