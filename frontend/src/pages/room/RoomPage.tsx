import { useRoomStore } from "@/zustand/roomStore.ts";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar.tsx";
import { MessageSquareIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card } from "@/shadcn/components/ui/card.tsx";
import React, { useState } from "react";
import ChatSidebar from "@/pages/room/ChatSidebar.tsx";
import EditRoomDialog from "@/pages/room/EditRoomDialog.tsx";
import { useMainStore } from "@/zustand/mainStore.ts";

export default function RoomPageContainer() {
  const { room } = useRoomStore();
  const userId = useMainStore((state) => state.currentUser?.id);

  const [isEditingRoom, setIsEditingRoom] = useState(false);

  const canEditRoom = userId === room.ownerId;

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
                <div className="flex -space-x-2">{/* TODO: Users */}</div>
              </div>
              {/* Chat */}
              <SidebarTrigger>
                <Button variant="outline" size="icon">
                  <MessageSquareIcon />
                </Button>
              </SidebarTrigger>
              {/* Edit */}
              {canEditRoom && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsEditingRoom(true);
                  }}
                >
                  <SettingsIcon />
                </Button>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 gap-4">
            {/* Main content area - Sheet music and controls */}
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <Card className="flex min-h-0 flex-1 flex-col p-4">
                Placeholder
              </Card>
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
      />
    </SidebarProvider>
  );
}
