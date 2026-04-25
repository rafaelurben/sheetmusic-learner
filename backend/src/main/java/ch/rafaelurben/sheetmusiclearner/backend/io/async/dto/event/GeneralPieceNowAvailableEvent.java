/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;

public record GeneralPieceNowAvailableEvent(PieceMetadataDto piece) {

  public static final String TYPE_DISCRIMINATOR = "piece-now-available";

  public EventDto<GeneralPieceNowAvailableEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
