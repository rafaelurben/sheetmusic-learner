import { Button } from "@/shadcn/components/ui/button";
import {
  PermissionType,
  type PiecePermissionDto,
  ResponseError,
} from "@/api/generated/openapi";
import { usePiecesApi } from "@/api/useAuthenticatedApiClient.ts";
import EditPieceDialog from "@/components/dialogs/EditPieceDialog.tsx";
import PiecePermissions from "@/pages/piece/permissions/PiecePermissions.tsx";
import PieceMetadataCard from "@/pages/piece/PieceMetadataCard.tsx";
import PieceScoreSheetsCard from "@/pages/piece/scoresheets/PieceScoreSheetsCard.tsx";
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
import { PlayIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PiecePlayerDialog from "@/pages/piece/PiecePlayerDialog.tsx";
import DeleteButton from "@/components/deleteButton.tsx";

export default function PiecePage() {
  const piece = usePieceStore((state) => state.piece);
  const currentUserId = useMainStore((state) => state.currentUser?.id);
  const removePiece = useMainStore((state) => state.removePiece);
  const piecesApi = usePiecesApi();

  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
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
      if (error instanceof ResponseError) {
        toast.error("Failed to delete piece: " + (await error.response.text()));
      }
    } finally {
      setIsDeletingPiece(false);
    }
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
              className="gap-2"
              onClick={() => {
                setIsPlayerOpen(true);
              }}
            >
              <PlayIcon className="size-4" />
              Play
            </Button>
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
              <DeleteButton
                title="Delete this piece?"
                disabled={isDeletingPiece}
                variant="destructive"
                action={() => void handleDeletePiece()}
              />
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
        <SheetContent className="w-auto sm:max-w-full md:max-w-lg">
          <SheetHeader>
            <SheetTitle>Permissions</SheetTitle>
          </SheetHeader>
          <PiecePermissions
            permissions={piece.permissions}
            isPublic={piece.isPublic}
          />
        </SheetContent>
      </Sheet>

      {isPlayerOpen && (
        <PiecePlayerDialog
          piece={piece}
          onClosePlayer={() => {
            setIsPlayerOpen(false);
          }}
        />
      )}

      <EditPieceDialog
        open={isEditingPiece}
        onOpenChange={setIsEditingPiece}
        piece={piece}
      />
    </div>
  );
}
