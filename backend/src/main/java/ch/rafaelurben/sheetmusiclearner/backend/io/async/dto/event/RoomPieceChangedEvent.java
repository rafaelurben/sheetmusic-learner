/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record RoomPieceChangedEvent(UUID pieceId) {

  public EventDto<RoomPieceChangedEvent> asDto() {
    return new EventDto<>("piece-changed", this);
  }
}
