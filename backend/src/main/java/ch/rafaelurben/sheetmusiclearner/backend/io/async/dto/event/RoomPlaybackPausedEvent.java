/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

public record RoomPlaybackPausedEvent() {

  public EventDto<RoomPlaybackPausedEvent> asDto() {
    return new EventDto<>("playback-paused", this);
  }
}
