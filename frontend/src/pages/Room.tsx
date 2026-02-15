import { useParams } from "react-router-dom";

export default function Room() {
  const { id } = useParams();

  return <h1>Room #{id}</h1>;
}
