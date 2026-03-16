/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;

public record UserRoomJoinedEvent(RoomDto room) {

  public EventDto<UserRoomJoinedEvent> asDto() {
    return new EventDto<>("room-joined", this);
  }
}
