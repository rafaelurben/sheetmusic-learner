/*
 * (C) 2026. - Rafael Urben
 */

export type SubscribeDestinationName =
  | "/topic/general"
  | "/user/queue/notifications"
  | `/topic/room.${string}`
  | `/topic/piece.${string}`;
