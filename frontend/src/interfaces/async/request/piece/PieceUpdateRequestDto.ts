/*
 * (C) 2026. - Rafael Urben
 */

import type { PieceDto } from "@/api/generated/openapi/models/PieceDto.ts";

export default interface PieceUpdateRequestDto {
  title: PieceDto["title"];
  composer: PieceDto["composer"];
  year: PieceDto["year"];
  description: PieceDto["description"];
  difficulty: PieceDto["difficulty"];
  bpmRange: PieceDto["bpmRange"];
  isPublic: PieceDto["isPublic"];
}
