/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import java.util.UUID;

public record PieceScoreSheetUpdatedEvent(UUID scoreSheetId, ScoreSheetDto scoreSheet) {

  public EventDto<PieceScoreSheetUpdatedEvent> asDto() {
    return new EventDto<>("score-sheet-updated", this);
  }
}
