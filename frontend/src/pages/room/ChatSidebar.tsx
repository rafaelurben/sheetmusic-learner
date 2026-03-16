import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/shadcn/components/ui/sidebar.tsx";
import { useRoomStore } from "@/zustand/roomStore.ts";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { SendIcon, XIcon } from "lucide-react";
import { useMainStore } from "@/zustand/mainStore.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar.tsx";
import { stompService } from "@/service/stompService.ts";
import type { SubmitEvent } from "react";
import { useRef, useState } from "react";
import type { UserDto } from "@/api/generated/openapi";
import type RoomChatMessageRequestDto from "@/interfaces/async/request/room/RoomChatMessageRequestDto.ts";

export default function ChatSidebar() {
  const roomId = useRoomStore((state) => state.room.id);
  const { chatMessages } = useRoomStore();
  const { currentUser } = useMainStore();
  const { toggleSidebar } = useSidebar();

  const [messageInput, setMessageInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSendMessage = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = messageInput.trim();
    if (!message) return;
    stompService.publish(`/app/room.${roomId}/chat`, {
      message,
    } satisfies RoomChatMessageRequestDto);
    setMessageInput("");
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("de-DE", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const getName = (user: UserDto) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else {
      return "Unknown";
    }
  };

  const getInitials = (user: UserDto) => {
    return (
      (user.firstName ? user.firstName[0] : "?") +
      (user.lastName ? user.lastName[0] : "?")
    );
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        {/* Chat Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {chatMessages.map((msg) =>
            msg.sender.id === currentUser?.id ? (
              // Current user message (right-aligned)
              <div key={msg.messageId} className="flex justify-end">
                <div className="max-w-[80%] space-y-1">
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    <span className="text-sm font-semibold">
                      {getName(msg.sender)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {msg.content}
                  </div>
                </div>
              </div>
            ) : (
              // Other users' messages (left-aligned)
              <div key={msg.messageId} className="flex gap-2">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={msg.sender.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(msg.sender)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {getName(msg.sender)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                    {msg.content}
                  </div>
                </div>
              </div>
            ),
          )}
          {chatMessages.length === 0 && (
            <div className="text-muted-foreground text-sm">
              Start chatting by sending a message. The chat history is only kept
              as long as you stay in this room.
            </div>
          )}
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {/* Chat Input */}
        <form className="flex gap-2" ref={formRef} onSubmit={handleSendMessage}>
          <Input
            name="message"
            placeholder="Type a message..."
            className="flex-1"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
            }}
          />
          <Button size="icon" type="submit" disabled={!messageInput.trim()}>
            <SendIcon />
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
