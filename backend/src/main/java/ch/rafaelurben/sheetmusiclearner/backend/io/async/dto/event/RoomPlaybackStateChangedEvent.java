/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import java.time.Instant;

public record RoomPlaybackStateChangedEvent(
    boolean playing,
    Integer lastPlaySectionPosition,
    Instant lastPlayTimestamp,
    float tempoMultiplier) {

  static RoomPlaybackStateChangedEvent fromRoom(Room room) {
    return new RoomPlaybackStateChangedEvent(
        room.getPlaying(),
        room.getLastPlaySectionPosition(),
        room.getLastPlayTimestamp(),
        room.getTempoMultiplier());
  }

  public EventDto<RoomPlaybackStateChangedEvent> asDto() {
    return new EventDto<>("playback-state-changed", this);
  }
}
