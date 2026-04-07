/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record RoomUserLeftEvent(UUID userId) {

  public EventDto<RoomUserLeftEvent> asDto() {
    return new EventDto<>("user-left", this);
  }
}
