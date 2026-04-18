/*
 * (C) 2026. - Rafael Urben
 */
import { useMemo, useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { Label } from "@/shadcn/components/ui/label";
import { Input } from "@/shadcn/components/ui/input";
import { useRoomsApi } from "@/api/useAuthenticatedApiClient.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMainStore } from "@/zustand/mainStore.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select.tsx";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
}: Readonly<CreateRoomDialogProps>) {
  const NO_PIECE_VALUE = "__none__";
  const navigate = useNavigate();
  const roomsApi = useRoomsApi();
  const piecesById = useMainStore((state) => state.pieces);
  const pieces = useMemo(() => Object.values(piecesById), [piecesById]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedPieceId, setSelectedPieceId] = useState(NO_PIECE_VALUE);

  const handleCreateRoom = async () => {
    if (!roomTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const newRoom = await roomsApi.createRoom({
        roomCreateRequestDto: {
          title: roomTitle.trim(),
          pieceId:
            selectedPieceId === NO_PIECE_VALUE ? undefined : selectedPieceId,
        },
      });
      onOpenChange(false);
      setRoomTitle("");
      setSelectedPieceId(NO_PIECE_VALUE);
      void navigate(`/rooms/${newRoom.id}`);
      toast.success("Successfully created new room!");
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRoomTitle("");
    setSelectedPieceId(NO_PIECE_VALUE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Room</DialogTitle>
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
                if (e.key === "Enter" && !isSubmitting) {
                  void handleCreateRoom();
                }
              }}
              disabled={isSubmitting}
              placeholder="Enter room title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-piece">Piece</Label>
            <Select
              value={selectedPieceId}
              onValueChange={setSelectedPieceId}
              disabled={isSubmitting}
            >
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
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleCreateRoom();
            }}
            disabled={isSubmitting || !roomTitle.trim()}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
