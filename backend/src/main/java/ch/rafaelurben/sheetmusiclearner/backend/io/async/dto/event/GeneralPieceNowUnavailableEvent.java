/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record GeneralPieceNowUnavailableEvent(UUID pieceId) {

  public EventDto<GeneralPieceNowUnavailableEvent> asDto() {
    return new EventDto<>("piece-now-unavailable", this);
  }
}
