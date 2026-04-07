/*
 * (C) 2026. - Rafael Urben
 */

import { Button } from "@/shadcn/components/ui/button.tsx";
import { MessageSquareIcon } from "lucide-react";
import { useSidebar } from "@/shadcn/components/ui/sidebar.tsx";

export default function ChatToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={() => {
        toggleSidebar();
      }}
    >
      <MessageSquareIcon />
      <span className="sr-only">Toggle Chat</span>
    </Button>
  );
}
