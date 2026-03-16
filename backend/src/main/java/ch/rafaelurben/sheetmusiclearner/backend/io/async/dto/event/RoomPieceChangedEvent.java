/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;

public record RoomPieceChangedEvent(PieceDto piece) {

  public EventDto<RoomPieceChangedEvent> asDto() {
    return new EventDto<>("piece-changed", this);
  }
}
