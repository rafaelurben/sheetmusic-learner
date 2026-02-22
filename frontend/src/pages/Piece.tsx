import { useParams } from "react-router-dom";

export default function Piece() {
  const { id } = useParams();

  return <h1>Piece #{id}</h1>;
}
