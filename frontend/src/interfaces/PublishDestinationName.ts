/*
 * (C) 2026. - Rafael Urben
 */

export type PublishDestinationName =
  | `/app/piece.${string}/update`
  | `/app/piece.${string}/sections/add`
  | `/app/piece.${string}/sections/update`
  | `/app/piece.${string}/sections/remove`
  | `/app/piece.${string}/permissions/add`
  | `/app/piece.${string}/permissions/update`
  | `/app/piece.${string}/permissions/remove`
  | `/app/room.${string}/update`
  | `/app/room.${string}/change-piece`
  | `/app/room.${string}/control/play`
  | `/app/room.${string}/control/pause`
  | `/app/room.${string}/control/position`
  | `/app/room.${string}/chat`;
