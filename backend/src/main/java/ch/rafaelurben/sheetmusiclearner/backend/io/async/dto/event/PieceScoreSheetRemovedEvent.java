/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record PieceScoreSheetRemovedEvent(UUID scoreSheetId) {

  public static final String TYPE_DISCRIMINATOR = "score-sheet-removed";

  public EventDto<PieceScoreSheetRemovedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
