/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import java.util.UUID;

public record PieceScoreSheetUpdatedEvent(UUID scoreSheetId, ScoreSheetDto scoreSheet) {

  public static final String TYPE_DISCRIMINATOR = "score-sheet-updated";

  public EventDto<PieceScoreSheetUpdatedEvent> asDto() {
    return new EventDto<>(TYPE_DISCRIMINATOR, this);
  }
}
