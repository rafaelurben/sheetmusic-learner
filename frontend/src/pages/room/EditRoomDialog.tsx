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

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  initialTitle: string;
}
export default function EditRoomDialog({
  open,
  onOpenChange,
  roomId,
  initialTitle,
}: Readonly<EditRoomDialogProps>) {
  const [roomTitle, setRoomTitle] = React.useState(initialTitle);

  React.useEffect(() => {
    if (open) {
      setRoomTitle(initialTitle);
    }
  }, [open, initialTitle]);

  const trimmedTitle = roomTitle.trim();
  const trimmedInitialTitle = initialTitle.trim();

  const handleSave = () => {
    if (!trimmedTitle) return;

    // Fire-and-forget: close immediately and wait for metadata event to reflect changes.
    onOpenChange(false);

    if (trimmedTitle === trimmedInitialTitle) return;

    try {
      stompService.publish(`/app/room.${roomId}/update`, {
        title: trimmedTitle,
      } satisfies RoomUpdateRequestDto);
    } catch (error) {
      console.error(`Failed to send room update for room ${roomId}:`, error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRoomTitle(initialTitle);
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
