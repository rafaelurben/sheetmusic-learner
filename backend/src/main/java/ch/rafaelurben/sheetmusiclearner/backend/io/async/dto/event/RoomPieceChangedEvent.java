/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record RoomPieceChangedEvent(UUID pieceId) {

  public static final String TYPE_DISCRIMINATOR = "piece-changed";

  public EventDto<RoomPieceChangedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
