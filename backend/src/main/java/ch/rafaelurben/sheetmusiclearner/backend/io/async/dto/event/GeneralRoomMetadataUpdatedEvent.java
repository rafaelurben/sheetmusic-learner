/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;

public record GeneralRoomMetadataUpdatedEvent(RoomMetadataDto room) {

  public static final String TYPE_DISCRIMINATOR = "room-metadata-updated";

  public EventDto<GeneralRoomMetadataUpdatedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
