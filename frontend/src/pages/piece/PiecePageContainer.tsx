/*
 * (C) 2026. - Rafael Urben
 */
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePiecesApi } from "@/api/useAuthenticatedApiClient.ts";
import { ResponseError } from "@/api/generated/openapi";
import { Spinner } from "@/shadcn/components/ui/spinner.tsx";
import { stompService } from "@/service/stompService.ts";
import type { PieceEventDto } from "@/interfaces/async/EventDto.ts";
import { toast } from "sonner";
import PiecePage from "@/pages/piece/PiecePage.tsx";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { useMainStore } from "@/zustand/mainStore.ts";
import { usePageTitle } from "@/zustand/pageTitleStore.ts";

export default function PiecePageContainer() {
  const { id } = useParams();
  const [notFound, setNotFound] = useState(false);
  const pieceFromMainStore = useMainStore((state) =>
    id ? state.pieces[id] : undefined,
  );
  const piecesApi = usePiecesApi();
  const navigate = useNavigate();
  const updatePiece = useMainStore((state) => state.updatePiece);
  const removePiece = useMainStore((state) => state.removePiece);

  const {
    setPiece,
    reset,
    initialLoadComplete,
    updatePieceMetadata,
    addPermission,
    updatePermission,
    removePermission,
    addSection,
    updateSection,
    removeSection,
    addScoreSheet,
    updateScoreSheet,
    removeScoreSheet,
  } = usePieceStore();

  const pageTitle = pieceFromMainStore?.title ?? (id ? `Room #${id}` : "Room");

  usePageTitle(pageTitle);

  useEffect(() => {
    if (id) {
      piecesApi
        .getPiece({ id })
        .then((piece) => {
          setPiece(piece);
          updatePiece(piece.id, piece);
          setNotFound(false);
        })
        .catch((err: unknown) => {
          console.error(`Failed to fetch piece ${id}:`, err);
          if (err instanceof ResponseError && err.response.status === 404) {
            setNotFound(true);
          }
        });
    }
  }, [id, piecesApi, setPiece, updatePiece]);

  useEffect(() => {
    if (!id || !initialLoadComplete || notFound) return;

    const subId = stompService.addSubscription(`/topic/piece.${id}`, (evt) => {
      const event = evt as PieceEventDto;
      console.log(`Event for piece ${id}:`, event);

      switch (event.type) {
        case "metadata-updated":
          updatePieceMetadata(event.payload.piece);
          updatePiece(event.payload.piece.id, event.payload.piece);
          break;
        case "section-added":
          addSection(event.payload.section);
          break;
        case "section-updated":
          updateSection(event.payload.sectionId, event.payload.section);
          break;
        case "section-removed":
          removeSection(event.payload.sectionId);
          break;
        case "score-sheet-added":
          addScoreSheet(event.payload.scoreSheet);
          break;
        case "score-sheet-updated":
          updateScoreSheet(
            event.payload.scoreSheetId,
            event.payload.scoreSheet,
          );
          break;
        case "score-sheet-removed":
          removeScoreSheet(event.payload.scoreSheetId);
          break;
        case "permission-added":
          addPermission({
            user: event.payload.user,
            permissionType: event.payload.permissionType,
          });
          break;
        case "permission-updated":
          updatePermission(event.payload.userId, event.payload.permissionType);
          break;
        case "permission-removed":
          removePermission(event.payload.userId);
          break;
        case "piece-deleted":
          removePiece(id);
          void navigate("/");
          toast.info("The piece you were viewing has been deleted.");
          break;
        default:
          console.warn("Unhandled event type for piece", id, event);
      }
    });

    return () => {
      stompService.removeSubscription(`/topic/piece.${id}`, subId);
      reset();
    };
  }, [
    id,
    initialLoadComplete,
    notFound,
    updatePieceMetadata,
    updatePiece,
    addPermission,
    updatePermission,
    removePermission,
    addSection,
    updateSection,
    removeSection,
    addScoreSheet,
    updateScoreSheet,
    removeScoreSheet,
    removePiece,
    navigate,
    reset,
  ]);

  if (notFound) {
    return <div>Piece not found</div>;
  }

  if (!initialLoadComplete) {
    return <Spinner />;
  }

  return <PiecePage />;
}
