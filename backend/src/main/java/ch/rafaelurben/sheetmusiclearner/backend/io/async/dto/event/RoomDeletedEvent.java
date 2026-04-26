/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record RoomDeletedEvent() {

  public static final String TYPE_DISCRIMINATOR = "room-deleted";

  public EventDto<RoomDeletedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
