/*
 * (C) 2026. - Rafael Urben
 */
import { create } from "zustand";
import type { PieceDto, SectionDto } from "@/api/generated/openapi";
import type { PieceEventDto } from "@/interfaces/async/EventDto.ts";
import type { SectionFormState } from "@/pages/piece/sections/PieceSectionFormUtils.ts";
import type { SetStateAction } from "react";

function normalizePositions(sections: SectionDto[]): SectionDto[] {
  return sections.map((section, index) => ({
    ...section,
    position: index,
  }));
}

interface PieceStoreState {
  piece: PieceDto;
  initialLoadComplete: boolean;
  editingSectionId: string | null;
  previewSheetId: string | null;
  sectionForm: SectionFormState | null;

  reset: () => void;
  setPiece: (piece: PieceDto) => void;
  setEditingSectionId: (sectionId: string | null) => void;
  setPreviewSheetId: (sheetId: string | null) => void;
  setSectionForm: (
    sectionForm: SetStateAction<SectionFormState | null>,
  ) => void;

  applyPieceEvent: (event: PieceEventDto) => void;
}

const initialState = {
  piece: {} as PieceDto,
  initialLoadComplete: false,
  editingSectionId: null,
  previewSheetId: null,
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
  setPreviewSheetId: (previewSheetId) => {
    set({ previewSheetId });
  },
  setSectionForm: (sectionForm) => {
    set((state) => ({
      sectionForm:
        typeof sectionForm === "function"
          ? sectionForm(state.sectionForm)
          : sectionForm,
    }));
  },
  applyPieceEvent: (event) => {
    switch (event.type) {
      case "metadata-updated":
        set((state) => ({
          piece: {
            ...state.piece,
            ...event.payload.piece,
          },
        }));
        return;
      case "permission-added":
        set((state) => ({
          piece: {
            ...state.piece,
            permissions: [
              ...state.piece.permissions,
              {
                user: event.payload.user,
                permissionType: event.payload.permissionType,
              },
            ],
          },
        }));
        return;
      case "permission-updated":
        set((state) => ({
          piece: {
            ...state.piece,
            permissions: state.piece.permissions.map((permission) =>
              permission.user.id === event.payload.userId
                ? {
                    ...permission,
                    permissionType: event.payload.permissionType,
                  }
                : permission,
            ),
          },
        }));
        return;
      case "permission-removed":
        set((state) => ({
          piece: {
            ...state.piece,
            permissions: state.piece.permissions.filter(
              (permission) => permission.user.id !== event.payload.userId,
            ),
          },
        }));
        return;
      case "section-added":
        set((state) => ({
          piece: {
            ...state.piece,
            sections: normalizePositions(
              state.piece.sections.toSpliced(
                event.payload.section.position,
                0,
                event.payload.section,
              ),
            ),
          },
        }));
        return;
      case "section-updated":
        set((state) => ({
          piece: {
            ...state.piece,
            sections: normalizePositions(
              state.piece.sections
                .filter((section) => section.id !== event.payload.sectionId)
                .toSpliced(
                  event.payload.section.position,
                  0,
                  event.payload.section,
                ),
            ),
          },
        }));
        return;
      case "section-removed":
        set((state) => ({
          editingSectionId:
            state.editingSectionId === event.payload.sectionId
              ? null
              : state.editingSectionId,
          sectionForm:
            state.editingSectionId === event.payload.sectionId
              ? null
              : state.sectionForm,
          piece: {
            ...state.piece,
            sections: normalizePositions(
              state.piece.sections.filter(
                (section) => section.id !== event.payload.sectionId,
              ),
            ),
          },
        }));
        return;
      case "score-sheet-added":
        set((state) => ({
          piece: {
            ...state.piece,
            scoreSheets: [
              ...state.piece.scoreSheets,
              event.payload.scoreSheet,
            ].sort((left, right) => left.position - right.position),
          },
        }));
        return;
      case "score-sheet-updated":
        set((state) => ({
          piece: {
            ...state.piece,
            scoreSheets: state.piece.scoreSheets
              .map((currentScoreSheet) =>
                currentScoreSheet.id === event.payload.scoreSheetId
                  ? event.payload.scoreSheet
                  : currentScoreSheet,
              )
              .sort((left, right) => left.position - right.position),
          },
        }));
        return;
      case "score-sheet-removed":
        set((state) => ({
          piece: {
            ...state.piece,
            sections: state.piece.sections.map((section) =>
              section.scoreSheetId === event.payload.scoreSheetId
                ? { ...section, scoreSheetId: null }
                : section,
            ),
            scoreSheets: state.piece.scoreSheets
              .filter(
                (scoreSheet) => scoreSheet.id !== event.payload.scoreSheetId,
              )
              .sort((left, right) => left.position - right.position),
          },
        }));
        return;
      case "piece-history-reverted":
        set({
          piece: event.payload.piece,
          editingSectionId: null,
          sectionForm: null,
        });
        return;
    }
  },
}));
