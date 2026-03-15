/*
 * (C) 2026. - Rafael Urben
 */
import * as React from "react";
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

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
}: Readonly<CreateRoomDialogProps>) {
  const navigate = useNavigate();
  const roomsApi = useRoomsApi();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [roomTitle, setRoomTitle] = React.useState("");

  const handleCreateRoom = async () => {
    if (!roomTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const newRoom = await roomsApi.createRoom({
        roomCreateRequestDto: {
          title: roomTitle,
        },
      });
      onOpenChange(false);
      setRoomTitle("");
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
