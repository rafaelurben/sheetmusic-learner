/*
 * (C) 2026. - Rafael Urben
 */
import type { UserDto } from "@/api/generated/openapi/models/UserDto.ts";

export default interface ChatMessagePayload {
  messageId: string;
  sender: UserDto;
  content: string;
  timestamp: string;
}
