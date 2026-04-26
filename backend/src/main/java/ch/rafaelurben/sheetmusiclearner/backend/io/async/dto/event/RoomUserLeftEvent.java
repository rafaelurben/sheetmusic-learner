/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record RoomUserLeftEvent(UUID userId) {

  public static final String TYPE_DISCRIMINATOR = "user-left";

  public EventDto<RoomUserLeftEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
