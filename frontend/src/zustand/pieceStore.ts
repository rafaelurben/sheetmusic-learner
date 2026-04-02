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
import type { SectionFormState } from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import type PieceUpdateRequestDto from "@/interfaces/async/request/piece/PieceUpdateRequestDto.ts";
import type { SetStateAction } from "react";

function normalizeSections(sections: SectionDto[]): SectionDto[] {
  return [...sections]
    .sort((left, right) => left.position - right.position)
    .map((section, index) => ({
      ...section,
      position: index,
    }));
}

interface PieceStoreState {
  piece: PieceDto;
  initialLoadComplete: boolean;
  editingSectionId: string | null;
  sectionForm: SectionFormState | null;

  reset: () => void;
  setPiece: (piece: PieceDto) => void;
  setEditingSectionId: (sectionId: string | null) => void;
  clearEditingSectionId: () => void;
  setSectionForm: (
    sectionForm: SetStateAction<SectionFormState | null>,
  ) => void;
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
  editingSectionId: null,
  sectionForm: null,
};

export const usePieceStore = create<PieceStoreState>((set) => ({
  ...initialState,
  reset: () => {
    set(initialState);
  },
  setPiece: (piece) => {
    set({ piece, initialLoadComplete: true });
  },
  setEditingSectionId: (editingSectionId) => {
    set({ editingSectionId });
  },
  clearEditingSectionId: () => {
    set({ editingSectionId: null, sectionForm: null });
  },
  setSectionForm: (sectionForm) => {
    set((state) => ({
      sectionForm:
        typeof sectionForm === "function"
          ? sectionForm(state.sectionForm)
          : sectionForm,
    }));
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
        sections: normalizeSections([
          ...state.piece.sections.slice(0, section.position),
          section,
          ...state.piece.sections.slice(section.position),
        ]),
      },
    }));
  },
  updateSection: (sectionId, section) => {
    set((state) => ({
      piece: {
        ...state.piece,
        sections: normalizeSections(
          state.piece.sections.map((currentSection) =>
            currentSection.id === sectionId ? section : currentSection,
          ),
        ),
      },
    }));
  },
  removeSection: (sectionId) => {
    set((state) => ({
      editingSectionId:
        state.editingSectionId === sectionId ? null : state.editingSectionId,
      sectionForm:
        state.editingSectionId === sectionId ? null : state.sectionForm,
      piece: {
        ...state.piece,
        sections: normalizeSections(
          state.piece.sections.filter((section) => section.id !== sectionId),
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
        sections: state.piece.sections.map((section) =>
          section.scoreSheetId === scoreSheetId
            ? { ...section, scoreSheetId: null }
            : section,
        ),
        scoreSheets: state.piece.scoreSheets
          .filter((scoreSheet) => scoreSheet.id !== scoreSheetId)
          .sort((left, right) => left.position - right.position),
      },
    }));
  },
}));
