/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;

public record GeneralRoomNowAvailableEvent(RoomMetadataDto room) {

  public EventDto<GeneralRoomNowAvailableEvent> asDto() {
    return new EventDto<>("room-now-available", this);
  }
}
