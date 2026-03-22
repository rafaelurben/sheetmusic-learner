import { useParams } from "react-router-dom";
import { useMainStore } from "@/zustand/mainStore.ts";

import { usePageTitle } from "@/zustand/pageTitleStore.ts";

export default function Piece() {
  const { id } = useParams();
  const piece = useMainStore((state) => (id ? state.pieces[id] : undefined));
  const pageTitle = piece?.title ?? (id ? `Piece #${id}` : "Piece");

  usePageTitle(pageTitle);

  return <h1>Piece #{id}</h1>;
}
