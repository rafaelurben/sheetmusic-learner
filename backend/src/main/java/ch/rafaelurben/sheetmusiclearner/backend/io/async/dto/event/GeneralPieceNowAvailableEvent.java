/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;

public record GeneralPieceNowAvailableEvent(PieceMetadataDto piece) {

  public EventDto<GeneralPieceNowAvailableEvent> asDto() {
    return new EventDto<>("piece-now-available", this);
  }
}
