/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;

public record RoomUserJoinedEvent(UserDto user) {

  public EventDto<RoomUserJoinedEvent> asDto() {
    return new EventDto<>("user-joined", this);
  }
}
