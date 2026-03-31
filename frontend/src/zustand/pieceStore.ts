/*
 * (C) 2026. - Rafael Urben
 */
import { create } from "zustand";
import type {
  PermissionType,
  PieceDto,
  PiecePermissionDto,
  ScoreSheetDto,
  SectionDto,
} from "@/api/generated/openapi";
import type PieceUpdateRequestDto from "@/interfaces/async/request/piece/PieceUpdateRequestDto.ts";

interface PieceStoreState {
  piece: PieceDto;
  initialLoadComplete: boolean;

  reset: () => void;
  setPiece: (piece: PieceDto) => void;
  updatePieceMetadata: (metadata: PieceUpdateRequestDto) => void;
  addPermission: (permission: PiecePermissionDto) => void;
  updatePermission: (userId: string, permissionType: PermissionType) => void;
  removePermission: (userId: string) => void;
  addSection: (section: SectionDto) => void;
  updateSection: (sectionId: string, section: SectionDto) => void;
  removeSection: (sectionId: string) => void;
  addScoreSheet: (scoreSheet: ScoreSheetDto) => void;
  updateScoreSheet: (scoreSheetId: string, scoreSheet: ScoreSheetDto) => void;
  removeScoreSheet: (scoreSheetId: string) => void;
}

const initialState = {
  piece: {} as PieceDto,
  initialLoadComplete: false,
};

export const usePieceStore = create<PieceStoreState>((set) => ({
  ...initialState,
  reset: () => {
    set(initialState);
  },
  setPiece: (piece) => {
    set({ piece, initialLoadComplete: true });
  },
  updatePieceMetadata: (metadata) => {
    set((state) => ({
      piece: {
        ...state.piece,
        ...metadata,
      },
    }));
  },
  addPermission: (permission) => {
    set((state) => ({
      piece: {
        ...state.piece,
        permissions: [...state.piece.permissions, permission],
      },
    }));
  },
  updatePermission: (userId, permissionType) => {
    set((state) => ({
      piece: {
        ...state.piece,
        permissions: state.piece.permissions.map((permission) =>
          permission.user.id === userId
            ? { ...permission, permissionType }
            : permission,
        ),
      },
    }));
  },
  removePermission: (userId) => {
    set((state) => ({
      piece: {
        ...state.piece,
        permissions: state.piece.permissions.filter(
          (permission) => permission.user.id !== userId,
        ),
      },
    }));
  },
  addSection: (section) => {
    set((state) => ({
      piece: {
        ...state.piece,
        sections: [...state.piece.sections, section],
      },
    }));
  },
  updateSection: (sectionId, section) => {
    set((state) => ({
      piece: {
        ...state.piece,
        sections: state.piece.sections.map((currentSection) =>
          currentSection.id === sectionId ? section : currentSection,
        ),
      },
    }));
  },
  removeSection: (sectionId) => {
    set((state) => ({
      piece: {
        ...state.piece,
        sections: state.piece.sections.filter(
          (section) => section.id !== sectionId,
        ),
      },
    }));
  },
  addScoreSheet: (scoreSheet) => {
    set((state) => ({
      piece: {
        ...state.piece,
        scoreSheets: [...state.piece.scoreSheets, scoreSheet].sort(
          (left, right) => left.position - right.position,
        ),
      },
    }));
  },
  updateScoreSheet: (scoreSheetId, scoreSheet) => {
    set((state) => ({
      piece: {
        ...state.piece,
        scoreSheets: state.piece.scoreSheets
          .map((currentScoreSheet) =>
            currentScoreSheet.id === scoreSheetId
              ? scoreSheet
              : currentScoreSheet,
          )
          .sort((left, right) => left.position - right.position),
      },
    }));
  },
  removeScoreSheet: (scoreSheetId) => {
    set((state) => ({
      piece: {
        ...state.piece,
        scoreSheets: state.piece.scoreSheets
          .filter((scoreSheet) => scoreSheet.id !== scoreSheetId)
          .sort((left, right) => left.position - right.position),
      },
    }));
  },
}));
