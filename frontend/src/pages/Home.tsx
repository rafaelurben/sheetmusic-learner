import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { usePageTitle } from "@/zustand/pageTitleStore.ts";
import { useMainStore } from "@/zustand/mainStore.ts";
import SearchableObjectList from "@/components/home/SearchableObjectList.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";
import { CreateRoomDialog } from "@/components/dialogs/CreateRoomDialog.tsx";
import { CreatePieceDialog } from "@/components/dialogs/CreatePieceDialog.tsx";

export default function Home() {
  usePageTitle("Home");

  const piecesRecord = useMainStore((state) => state.pieces);
  const roomsRecord = useMainStore((state) => state.rooms);

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCreatingPiece, setIsCreatingPiece] = useState(false);

  const pieces = useMemo(() => Object.values(piecesRecord), [piecesRecord]);
  const rooms = useMemo(() => Object.values(roomsRecord), [roomsRecord]);

  return (
    <div className="grid gap-4 md:grid-cols-2 p-2 pt-0">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome back! Browse your pieces and rooms, or create a new one to
            get started.
          </p>
        </CardContent>
      </Card>

      <SearchableObjectList
        listTitle="Pieces"
        searchPlaceholder="Search pieces"
        emptyListText="No pieces available."
        emptySearchText="No pieces match your search."
        objects={pieces}
        searchKeys={[
          "description",
          "composer",
          "difficulty",
          "year",
          "bpmRange",
        ]}
        toPath={(piece) => `/pieces/${piece.id}`}
        headerAction={
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              setIsCreatingPiece(true);
            }}
            aria-label="Create piece"
          >
            <PlusIcon className="size-4" />
          </Button>
        }
      />

      <SearchableObjectList
        listTitle="Rooms"
        searchPlaceholder="Search rooms"
        emptyListText="No rooms available."
        emptySearchText="No rooms match your search."
        objects={rooms}
        searchKeys={[]}
        toPath={(room) => `/rooms/${room.id}`}
        headerAction={
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              setIsCreatingRoom(true);
            }}
            aria-label="Create room"
          >
            <PlusIcon className="size-4" />
          </Button>
        }
      />

      <CreateRoomDialog
        open={isCreatingRoom}
        onOpenChange={setIsCreatingRoom}
      />
      <CreatePieceDialog
        open={isCreatingPiece}
        onOpenChange={setIsCreatingPiece}
      />
    </div>
  );
}
