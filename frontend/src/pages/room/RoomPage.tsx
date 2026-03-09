import { useRoomStore } from "@/zustand/roomStore.ts";

export default function RoomPageContainer() {
  const { room } = useRoomStore();

  return (
    <h1>
      Room #{room.id} / {room.title}
    </h1>
  );
}
