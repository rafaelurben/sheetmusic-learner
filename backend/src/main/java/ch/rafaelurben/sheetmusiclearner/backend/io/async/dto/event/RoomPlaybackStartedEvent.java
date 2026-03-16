/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record RoomPlaybackStartedEvent() {

  public EventDto<RoomPlaybackStartedEvent> asDto() {
    return new EventDto<>("playback-started", this);
  }
}
