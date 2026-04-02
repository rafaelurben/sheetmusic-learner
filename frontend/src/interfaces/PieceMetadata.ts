import type { PieceDto } from "@/api/generated/openapi/models/PieceDto.ts";

export default interface PieceMetadata {
  id: PieceDto["id"];
  title: PieceDto["title"];
  composer: PieceDto["composer"];
  year: PieceDto["year"];
  description: PieceDto["description"];
  difficulty: PieceDto["difficulty"];
  bpmRange: PieceDto["bpmRange"];
  isPublic: PieceDto["isPublic"];
}
