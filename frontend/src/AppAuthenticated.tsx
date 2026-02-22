import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Room from "./pages/Room.tsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/components/ui/sidebar.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/components/ui/breadcrumb.tsx";
import { Separator } from "@/shadcn/components/ui/separator.tsx";
import { AppSidebar } from "@/components/sidebar/AppSidebar.tsx";
import React from "react";
import Piece from "@/pages/Piece.tsx";
import DummyPiece from "@/pages/DummyPiece.tsx";
import DummyRoom from "@/pages/DummyRoom.tsx";

export default function AppAuthenticated() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6">
      <SidebarProvider
        className="flex"
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Pages</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>A page</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms/dummy" element={<DummyRoom />} />
              <Route path="/rooms/:id" element={<Room />} />
              <Route path="/pieces/dummy" element={<DummyPiece />} />
              <Route path="/pieces/:id" element={<Piece />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
