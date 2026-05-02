import { useRoomStore } from "@/zustand/roomStore.ts";
import { SidebarProvider } from "@/shadcn/components/ui/sidebar.tsx";
import { SettingsIcon, UsersIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card, CardContent } from "@/shadcn/components/ui/card.tsx";
import React, { useState } from "react";
import ChatSidebar from "@/pages/room/ChatSidebar.tsx";
import EditRoomDialog from "@/pages/room/EditRoomDialog.tsx";
import RoomScoreSheetPanel from "@/pages/room/RoomScoreSheetPanel.tsx";
import { useMainStore } from "@/zustand/mainStore.ts";
import { useRoomsApi } from "@/api/useAuthenticatedApiClient.ts";
import { toast } from "sonner";
import { usePieceStore } from "@/zustand/pieceStore.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip.tsx";
import ChatToggle from "@/pages/room/ChatToggle.tsx";
import DeleteButton from "@/components/deleteButton.tsx";

export default function RoomPageContainer() {
  const { room } = useRoomStore();
  const piece = usePieceStore((state) => state.piece);
  const userId = useMainStore((state) => state.currentUser?.id);
  const removeRoom = useMainStore((state) => state.removeRoom);
  const roomsApi = useRoomsApi();

  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);

  const canEditRoom = userId === room.ownerId;

  const handleDeleteRoom = async () => {
    if (isDeletingRoom) return;

    setIsDeletingRoom(true);
    try {
      await roomsApi.deleteRoom({ id: room.id });
      removeRoom(room.id);
      toast.success("Room deleted.");
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room.");
    } finally {
      setIsDeletingRoom(false);
    }
  };

  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          "--sidebar-width": "24rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <div className="flex h-full w-full">
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0 ">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold sm:text-2xl">
              Room: {room.title}
            </h1>
            <div className="flex items-center gap-3">
              {/* Users */}
              <div className="flex items-center gap-2">
                <UsersIcon className="size-5 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {room.roomUsers.map((user) => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="size-8 border-2 border-background">
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          <AvatarFallback className="text-xs">
                            {(user.firstName ? user.firstName[0] : "?") +
                              (user.lastName ? user.lastName[0] : "?")}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        {user.firstName} {user.lastName}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
              {/* Chat */}
              <ChatToggle />
              {/* Edit */}
              {canEditRoom && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsEditingRoom(true);
                    }}
                  >
                    <SettingsIcon />
                  </Button>
                  <DeleteButton
                    variant="destructive"
                    title="Delete this room?"
                    disabled={isDeletingRoom}
                    action={() => void handleDeleteRoom()}
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 gap-4">
            {/* Main content area - Sheet music and controls */}
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              {piece.id ? (
                <RoomScoreSheetPanel
                  room={room}
                  canEditRoom={canEditRoom}
                  piece={piece}
                />
              ) : (
                <Card className="flex min-h-0 flex-1 flex-col">
                  <CardContent className="flex min-h-0 flex-1 items-center justify-center text-center text-muted-foreground">
                    No piece loaded for this room.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar />
      </div>

      <EditRoomDialog
        open={isEditingRoom}
        onOpenChange={setIsEditingRoom}
        roomId={room.id}
        initialTitle={room.title}
        initialPieceId={room.pieceId}
      />
    </SidebarProvider>
  );
}
