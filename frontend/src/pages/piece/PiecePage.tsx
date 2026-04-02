import { Button } from "@/shadcn/components/ui/button";
import {
  PermissionType,
  type PiecePermissionDto,
} from "@/api/generated/openapi";
import { usePiecesApi } from "@/api/useAuthenticatedApiClient.ts";
import EditPieceDialog from "@/pages/piece/EditPieceDialog.tsx";
import PiecePermissions from "@/pages/piece/PiecePermissions.tsx";
import PieceMetadataCard from "@/pages/piece/PieceMetadataCard.tsx";
import PieceScoreSheetsCard from "@/pages/piece/PieceScoreSheetsCard.tsx";
import PieceSectionsCard from "@/pages/piece/sections/PieceSectionsCard.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/components/ui/sheet";
import { useMainStore } from "@/zustand/mainStore.ts";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import { usePageTitle } from "@/zustand/pageTitleStore.ts";
import { Trash2Icon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PiecePage() {
  const piece = usePieceStore((state) => state.piece);
  const currentUserId = useMainStore((state) => state.currentUser?.id);
  const removePiece = useMainStore((state) => state.removePiece);
  const piecesApi = usePiecesApi();

  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isEditingPiece, setIsEditingPiece] = useState(false);
  const [isDeletingPiece, setIsDeletingPiece] = useState(false);

  const currentUserPermission = piece.permissions.find(
    (permission: PiecePermissionDto) => permission.user.id === currentUserId,
  );
  const canDeletePiece =
    currentUserPermission?.permissionType === PermissionType.Owner;
  const canEditPiece =
    currentUserPermission?.permissionType === PermissionType.Owner ||
    currentUserPermission?.permissionType === PermissionType.Editor;

  const sortedScoreSheets = [...piece.scoreSheets].sort(
    (left, right) => left.position - right.position,
  );

  const handleDeletePiece = async () => {
    if (isDeletingPiece) return;

    setIsDeletingPiece(true);
    try {
      await piecesApi.deletePiece({ id: piece.id });
      removePiece(piece.id);
      toast.success("Piece deleted.");
    } catch (error) {
      console.error("Failed to delete piece:", error);
      toast.error("Failed to delete piece.");
    } finally {
      setIsDeletingPiece(false);
    }
  };

  const handleConfirmDeletePiece = () => {
    toast.error("Delete this piece?", {
      description: "This action cannot be undone.",
      closeButton: false,
      action: {
        label: "Delete",
        onClick: () => {
          void handleDeletePiece();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss();
        },
      },
    });
  };

  usePageTitle(piece.title);

  return (
    <div className="flex h-full w-full">
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-2 pt-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">
            Piece: {piece.title}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setIsPermissionsOpen(true);
              }}
            >
              <UsersIcon className="size-4" />
              Permissions
            </Button>
            {canDeletePiece && (
              <Button
                variant="destructive"
                size="icon"
                disabled={isDeletingPiece}
                onClick={handleConfirmDeletePiece}
              >
                <Trash2Icon className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <PieceMetadataCard
              piece={piece}
              canEdit={canEditPiece}
              openEditDialog={() => {
                setIsEditingPiece(true);
              }}
            />
            <PieceScoreSheetsCard
              scoreSheets={sortedScoreSheets}
              canEdit={canEditPiece}
            />
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-md">
            <PieceSectionsCard
              sections={piece.sections}
              canEdit={canEditPiece}
            />
          </div>
        </div>
      </div>

      <Sheet open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Permissions</SheetTitle>
          </SheetHeader>
          <PiecePermissions
            permissions={piece.permissions}
            isPublic={piece.isPublic}
          />
        </SheetContent>
      </Sheet>

      <EditPieceDialog
        open={isEditingPiece}
        onOpenChange={setIsEditingPiece}
        piece={piece}
      />
    </div>
  );
}
