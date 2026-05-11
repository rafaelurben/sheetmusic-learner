/*
 * (C) 2026. - Rafael Urben
 */
import {
  type PieceDto,
  type PieceHistoryRevisionDto,
  ResponseError,
} from "@/api/generated/openapi";
import { usePiecesApi } from "@/api/useAuthenticatedApiClient.ts";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog.tsx";
import { EyeIcon, RotateCcw } from "lucide-react";
import { Badge } from "@/shadcn/components/ui/badge";
import PiecePlayerDialog from "@/pages/piece/PiecePlayerDialog.tsx";
import { Spinner } from "@/shadcn/components/ui/spinner.tsx";

interface Props {
  isOpen: boolean;
  pieceId: string;
}

export default function PieceHistory({ isOpen, pieceId }: Readonly<Props>) {
  const piecesApi = usePiecesApi();

  const [history, setHistory] = useState<PieceHistoryRevisionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] =
    useState<PieceHistoryRevisionDto | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isPreviewPlayerOpen, setIsPreviewPlayerOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewPiece, setPreviewPiece] = useState<PieceDto | null>(null);

  const newestRevisionId = useMemo(
    () => (history.length > 0 ? history[0].revisionId : null),
    [history],
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const historyData = await piecesApi.getPieceHistory({ id: pieceId });
        setHistory(historyData);
      } catch (error: unknown) {
        console.error("Failed to fetch piece history:", error);
        if (error instanceof ResponseError) {
          if (error.response.status === 403) {
            toast.error(
              "You don't have permission to view this piece's history.",
            );
          } else {
            toast.error("Failed to fetch piece history.");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, [isOpen, pieceId, piecesApi]);

  const handleRevertClick = (revision: PieceHistoryRevisionDto) => {
    setSelectedRevision(revision);
    setShowConfirmDialog(true);
  };

  const handlePreviewClick = async (revision: PieceHistoryRevisionDto) => {
    setSelectedRevision(revision);
    setIsLoadingPreview(true);
    const piece = await piecesApi.previewPieceAtRevision({
      id: pieceId,
      revisionId: revision.revisionId,
    });
    setPreviewPiece(piece);
    setIsLoadingPreview(false);
    setIsPreviewPlayerOpen(true);
  };

  const handleConfirmRevert = async () => {
    if (!selectedRevision) return;

    setIsReverting(true);
    try {
      await piecesApi.revertPieceToRevision({
        id: pieceId,
        revisionId: selectedRevision.revisionId,
      });
      toast.success(
        `Piece reverted to revision ${selectedRevision.revisionId}.`,
      );
      setShowConfirmDialog(false);
      setSelectedRevision(null);
    } catch (error: unknown) {
      console.error("Failed to revert piece:", error);
      if (error instanceof ResponseError) {
        if (error.response.status === 403) {
          toast.error("You don't have permission to revert this piece.");
        } else if (error.response.status === 404) {
          toast.error("This revision does not exist.");
        } else {
          toast.error("Failed to revert piece.");
        }
      }
    } finally {
      setIsReverting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground w-full">
        No history available
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4 overflow-y-scroll">
      <div className="text-sm text-muted-foreground">
        {history.length} {history.length === 1 ? "revision" : "revisions"}
      </div>

      <div className="space-y-2">
        {history.map((revision) => (
          <div
            key={revision.revisionId}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium">
                Revision {revision.revisionId}{" "}
                {revision.revisionId === newestRevisionId && (
                  <Badge
                    className="ms-1"
                    variant="default"
                    title="This is the current revision."
                  >
                    Current
                  </Badge>
                )}
                {revision.revisionKind === "REVERT" && (
                  <Badge
                    className="ms-1"
                    variant="destructive"
                    title="This revision was created by reverting to another revision."
                  >
                    Revert
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {revision.user.firstName} {revision.user.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(revision.timestamp).toLocaleString()}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void handlePreviewClick(revision);
              }}
              disabled={isLoadingPreview}
              className="ml-2"
            >
              {isLoadingPreview &&
              revision.revisionId === selectedRevision?.revisionId ? (
                <Spinner />
              ) : (
                <EyeIcon className="mr-2 h-4 w-4" />
              )}
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleRevertClick(revision);
              }}
              disabled={revision.revisionId === newestRevisionId}
              className="ml-2"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Revert
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Revert</DialogTitle>
            <DialogDescription>
              Are you sure you want to revert to revision{" "}
              {selectedRevision?.revisionId}? This will restore all metadata,
              score sheets and sections to their state at that revision. User
              permissions will NOT be reverted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                void handleConfirmRevert();
              }}
              disabled={isReverting}
            >
              {isReverting ? "Reverting..." : "Revert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isPreviewPlayerOpen && previewPiece && (
        <PiecePlayerDialog
          piece={previewPiece}
          onClosePlayer={() => {
            setIsPreviewPlayerOpen(false);
          }}
        />
      )}
    </div>
  );
}
