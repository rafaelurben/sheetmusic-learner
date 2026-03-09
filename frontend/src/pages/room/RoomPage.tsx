import { useRoomStore } from "@/zustand/roomStore.ts";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar.tsx";
import { MessageSquareIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { Card } from "@/shadcn/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shadcn/components/ui/dialog.tsx";
import React, { useState } from "react";
import ChatSidebar from "@/pages/room/ChatSidebar.tsx";
import { useMainStore } from "@/zustand/mainStore.ts";

export default function RoomPageContainer() {
  const { room } = useRoomStore();
  const isConnected = useMainStore((state) => state.connected);

  const [isEditingRoom, setIsEditingRoom] = useState(false);

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
            <div className="flex items-center gap-3">
              <div
                className={
                  "flex size-4 items-center justify-center rounded-full text-xs font-semibold text-white " +
                  (isConnected ? "bg-green-500" : "bg-red-500")
                }
              >
                ●
              </div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Room: {room.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Users */}
              <div className="flex items-center gap-2">
                <UsersIcon className="size-5 text-muted-foreground" />
                <div className="flex -space-x-2">{/* TODO: Users */}</div>
              </div>
              <SidebarTrigger>
                <Button variant="outline" size="icon">
                  <MessageSquareIcon />
                </Button>
              </SidebarTrigger>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsEditingRoom(true);
                }}
              >
                <SettingsIcon />
              </Button>
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

      {/* Edit Room Dialog */}
      <Dialog open={isEditingRoom} onOpenChange={setIsEditingRoom}>
        <DialogContent>
          <DialogTitle>Placeholder...</DialogTitle>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
