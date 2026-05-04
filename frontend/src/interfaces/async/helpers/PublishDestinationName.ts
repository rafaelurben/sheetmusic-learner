/*
 * (C) 2026. - Rafael Urben
 */

export type PublishDestinationName =
  | `/app/piece.${string}/update`
  | `/app/piece.${string}/score-sheet/update`
  | `/app/piece.${string}/score-sheet/delete`
  | `/app/piece.${string}/section/add`
  | `/app/piece.${string}/section/update`
  | `/app/piece.${string}/section/remove`
  | `/app/piece.${string}/permission/add`
  | `/app/piece.${string}/permission/update`
  | `/app/piece.${string}/permission/remove`
  | `/app/room.${string}/update`
  | `/app/room.${string}/change-piece`
  | `/app/room.${string}/control/play`
  | `/app/room.${string}/control/pause`
  | `/app/room.${string}/control/position`
  | `/app/room.${string}/control/config`
  | `/app/room.${string}/chat`;
