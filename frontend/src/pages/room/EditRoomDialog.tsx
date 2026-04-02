/*
 * (C) 2026. - Rafael Urben
 */
import * as React from "react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { stompService } from "@/service/stompService.ts";
import type RoomUpdateRequestDto from "@/interfaces/async/request/room/RoomUpdateRequestDto.ts";
import type RoomChangePieceRequestDto from "@/interfaces/async/request/room/RoomChangePieceRequestDto.ts";
import { useMainStore } from "@/zustand/mainStore.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  initialTitle: string;
  initialPieceId?: string | null;
}
export default function EditRoomDialog({
  open,
  onOpenChange,
  roomId,
  initialTitle,
  initialPieceId,
}: Readonly<EditRoomDialogProps>) {
  const NO_PIECE_VALUE = "__none__";
  const piecesById = useMainStore((state) => state.pieces);
  const pieces = React.useMemo(() => Object.values(piecesById), [piecesById]);
  const [roomTitle, setRoomTitle] = React.useState(initialTitle);
  const [selectedPieceId, setSelectedPieceId] = React.useState(
    initialPieceId ?? NO_PIECE_VALUE,
  );

  React.useEffect(() => {
    if (open) {
      setRoomTitle(initialTitle);
      setSelectedPieceId(initialPieceId ?? NO_PIECE_VALUE);
    }
  }, [open, initialTitle, initialPieceId]);

  const trimmedTitle = roomTitle.trim();
  const trimmedInitialTitle = initialTitle.trim();
  const normalizedInitialPieceId = initialPieceId ?? NO_PIECE_VALUE;

  const handleSave = () => {
    if (!trimmedTitle) return;

    // Fire-and-forget: close immediately and wait for metadata event to reflect changes.
    onOpenChange(false);

    if (trimmedTitle !== trimmedInitialTitle) {
      stompService.publish(`/app/room.${roomId}/update`, {
        title: trimmedTitle,
      } satisfies RoomUpdateRequestDto);
    }

    if (
      selectedPieceId !== NO_PIECE_VALUE &&
      selectedPieceId !== normalizedInitialPieceId
    ) {
      stompService.publish(`/app/room.${roomId}/change-piece`, {
        pieceId: selectedPieceId,
      } satisfies RoomChangePieceRequestDto);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRoomTitle(initialTitle);
    setSelectedPieceId(initialPieceId ?? NO_PIECE_VALUE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-title">Title</Label>
            <Input
              id="room-title"
              value={roomTitle}
              onChange={(e) => {
                setRoomTitle(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              placeholder="Enter room title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-piece">Piece</Label>
            <Select value={selectedPieceId} onValueChange={setSelectedPieceId}>
              <SelectTrigger id="room-piece">
                <SelectValue placeholder="Select a piece" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PIECE_VALUE}>
                  No piece selected
                </SelectItem>
                {pieces.map((piece) => (
                  <SelectItem key={piece.id} value={piece.id}>
                    {piece.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!trimmedTitle}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
