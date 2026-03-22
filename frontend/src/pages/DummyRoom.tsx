import { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Label } from "@/shadcn/components/ui/label";
import { Input } from "@/shadcn/components/ui/input";
import { Avatar, AvatarFallback } from "@/shadcn/components/ui/avatar";
import { AspectRatio } from "@/shadcn/components/ui/aspect-ratio";
import { Slider } from "@/shadcn/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { Switch } from "@/shadcn/components/ui/switch";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageSquareIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import { usePageTitle } from "@/zustand/pageTitleStore.ts";

export default function DummyRoom() {
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempoMultiplier, setTempoMultiplier] = useState([1]);

  // Mock data
  const room = {
    title: "Room Title",
    isPublic: true,
    piece: "Piece ABC",
  };

  usePageTitle(`Room: ${room.title}`);

  const users = [
    { id: 1, name: "Alice", initials: "A" },
    { id: 2, name: "Bob", initials: "B" },
    { id: 3, name: "Charlie", initials: "C" },
  ];

  const chatMessages = [
    {
      id: 1,
      user: "Alice",
      message: "Hello everyone!",
      time: "10:23",
      isCurrentUser: false,
    },
    {
      id: 2,
      user: "Bob",
      message: "Ready to practice?",
      time: "10:24",
      isCurrentUser: false,
    },
    {
      id: 3,
      user: "You",
      message: "Yes, let's start!",
      time: "10:25",
      isCurrentUser: true,
    },
  ];

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
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-4 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white">
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
                <div className="flex -space-x-2">
                  {users.map((user) => (
                    <Avatar
                      key={user.id}
                      className="size-8 border-2 border-background"
                    >
                      <AvatarFallback className="text-xs">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
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
              {/* Sheet Music Display */}
              <Card className="flex min-h-0 flex-1 flex-col">
                <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-6">
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <AspectRatio ratio={1.414} className="w-full">
                      <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10">
                        <div className="text-center text-muted-foreground">
                          <p className="text-lg font-medium">
                            Sheet Music Display
                          </p>
                          <p className="text-sm">
                            Music notation will be rendered here
                          </p>
                        </div>
                      </div>
                    </AspectRatio>
                  </div>

                  {/* Playback Controls */}
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t pt-4">
                    <Button variant="outline" size="icon">
                      <ChevronLeftIcon />
                    </Button>

                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setIsPlaying(!isPlaying);
                        }}
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </Button>

                      {/* Tempo Multiplier Slider */}
                      <div className="flex w-full items-center gap-3 sm:w-auto">
                        <Label className="text-sm text-muted-foreground">
                          Tempo:
                        </Label>
                        <Slider
                          value={tempoMultiplier}
                          onValueChange={setTempoMultiplier}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="w-full sm:w-32"
                        />
                        <span className="w-12 text-sm text-muted-foreground">
                          {tempoMultiplier[0].toFixed(1)}x
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" size="icon">
                      <ChevronRightIcon />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <Sidebar side="right" collapsible="offcanvas">
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">Chat</h2>
          </SidebarHeader>
          <SidebarContent className="p-4">
            {/* Chat Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {chatMessages.map((msg) =>
                msg.isCurrentUser ? (
                  // Current user message (right-aligned)
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] space-y-1">
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                        <span className="text-sm font-semibold">
                          {msg.user}
                        </span>
                      </div>
                      <div className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Other users' messages (left-aligned)
                  <div key={msg.id} className="flex gap-2">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {msg.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {msg.user}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            {/* Chat Input */}
            <div className="flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button size="icon">
                <SendIcon />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Edit Room Dialog */}
      <Dialog open={isEditingRoom} onOpenChange={setIsEditingRoom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-title">Title</Label>
              <Input id="room-title" defaultValue={room.title} />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="room-public" className="flex-1">
                Public
              </Label>
              <Switch id="room-public" defaultChecked={room.isPublic} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-piece">Piece</Label>
              <Select defaultValue={room.piece}>
                <SelectTrigger id="room-piece">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Piece ABC">Piece ABC</SelectItem>
                  <SelectItem value="Piece XYZ">Piece XYZ</SelectItem>
                  <SelectItem value="Test Piece 1">Test Piece 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingRoom(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditingRoom(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
