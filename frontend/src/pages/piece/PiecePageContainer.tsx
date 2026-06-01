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
import ErrorPage from "@/pages/error/ErrorPage.tsx";
import ForbiddenPage from "@/pages/error/ForbiddenPage.tsx";

export default function PiecePageContainer() {
  const { id } = useParams();
  const [notFound, setNotFound] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const connected = useMainStore((state) => state.connected);
  const pieceFromMainStore = useMainStore((state) =>
    id ? state.pieces[id] : undefined,
  );
  const piecesApi = usePiecesApi();
  const navigate = useNavigate();

  const { setPiece, reset, initialLoadComplete, applyPieceEvent } =
    usePieceStore();

  usePageTitle(pieceFromMainStore?.title ?? "Unknown piece");

  useEffect(() => {
    if (id) {
      piecesApi
        .getPiece({ id })
        .then((piece) => {
          setPiece(piece);
          setNotFound(false);
        })
        .catch((err: unknown) => {
          console.error(`Failed to fetch piece ${id}:`, err);
          if (err instanceof ResponseError) {
            if (err.response.status === 404) {
              setNotFound(true);
            } else if (err.response.status === 403) {
              setNotAllowed(true);
            }
          }
        });
    }
  }, [id, piecesApi, setPiece, connected]); // refresh on connected change

  useEffect(() => {
    if (!id || !initialLoadComplete || notFound) return;

    const subId = stompService.addSubscription(`/topic/piece.${id}`, (evt) => {
      const event = evt as PieceEventDto;
      console.log(`Event for piece ${id}:`, event);

      applyPieceEvent(event);

      if (event.type === "piece-deleted") {
        void navigate("/");
        toast.info("The piece you were viewing has been deleted.");
      }
    });

    return () => {
      stompService.removeSubscription(`/topic/piece.${id}`, subId);
      reset();
    };
  }, [id, initialLoadComplete, notFound, applyPieceEvent, navigate, reset]);

  if (notFound) {
    return (
      <ErrorPage
        title="Piece not found"
        description="This piece was not found."
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        action={() => navigate("/")}
      />
    );
  } else if (notAllowed) {
    return <ForbiddenPage />;
  } else if (initialLoadComplete) {
    return <PiecePage />;
  } else {
    return <Spinner />;
  }
}
