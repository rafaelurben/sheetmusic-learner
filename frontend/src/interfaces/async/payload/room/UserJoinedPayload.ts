/*
 * (C) 2026. - Rafael Urben
 */
import type { UserDto } from "@/api/generated/openapi";

export default interface UserJoinedPayload {
  user: UserDto;
}
