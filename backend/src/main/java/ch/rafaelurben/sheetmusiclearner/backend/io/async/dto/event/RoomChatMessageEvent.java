/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import java.time.Instant;
import java.util.UUID;

public record RoomChatMessageEvent(
    UUID messageId, UserDto sender, String content, Instant timestamp) {

  public EventDto<RoomChatMessageEvent> asDto() {
    return new EventDto<>("chat-message", this);
  }
}
