/*
 * (C) 2026. - Rafael Urben
 */
import { create } from "zustand";
import type RoomMetadata from "@/interfaces/RoomMetadata.ts";
import type PieceMetadata from "@/interfaces/PieceMetadata.ts";
import type { UserDto } from "@/api/generated/openapi";

export interface MainStoreState {
  connected: boolean | null;
  rooms: Record<string, RoomMetadata>;
  pieces: Record<string, PieceMetadata>;
  currentUser: UserDto | null;

  setConnected: (value: boolean) => void;
  setCurrentUser: (user: UserDto) => void;
  addRoom: (room: RoomMetadata) => void;
  updateRoom: (roomId: string, room: RoomMetadata) => void;
  removeRoom: (roomId: string) => void;
  addPiece: (piece: PieceMetadata) => void;
  updatePiece: (pieceId: string, piece: PieceMetadata) => void;
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
  addRoom: (room: RoomMetadata) => {
    set((state) => ({
      rooms: {
        ...state.rooms,
        [room.id]: room,
      },
    }));
  },
  updateRoom: (roomId: string, room: RoomMetadata) => {
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
  addPiece: (piece: PieceMetadata) => {
    set((state) => ({
      pieces: {
        ...state.pieces,
        [piece.id]: piece,
      },
    }));
  },
  updatePiece: (pieceId: string, piece: PieceMetadata) => {
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
