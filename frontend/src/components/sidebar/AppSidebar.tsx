import * as React from "react";
import { Music2Icon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/components/ui/sidebar.tsx";
import { NavUser } from "@/components/sidebar/NavUser.tsx";
import { useAuth } from "react-oidc-context";
import { Link, NavLink } from "react-router-dom";

import { useMainStore } from "@/zustand/mainStore.ts";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth();
  const piecesRecord = useMainStore((state) => state.pieces);
  const roomsRecord = useMainStore((state) => state.rooms);

  const pieces = React.useMemo(
    () => Object.values(piecesRecord),
    [piecesRecord],
  );
  const rooms = React.useMemo(() => Object.values(roomsRecord), [roomsRecord]);

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Music2Icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">sheetmusic-learner</span>
                  <span className="font-light">by @rafaelurben</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pieces</SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            {pieces.map((piece) => (
              <SidebarMenuItem key={piece.id}>
                <SidebarMenuButton asChild>
                  <NavLink to={`/pieces/${piece.id}`} className="font-medium">
                    {piece.title}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Rooms</SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            {rooms.map((room) => (
              <SidebarMenuItem key={room.id}>
                <SidebarMenuButton asChild>
                  <NavLink to={`/rooms/${room.id}`} className="font-medium">
                    {room.title}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: auth.user?.profile.name ?? "Unknown",
            email: auth.user?.profile.email ?? "Unknown",
            avatar: auth.user?.profile.picture ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
