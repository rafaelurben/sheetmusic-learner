/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.SectionDto;
import java.util.UUID;

public record PieceSectionUpdatedEvent(UUID sectionId, SectionDto section) {

  public EventDto<PieceSectionUpdatedEvent> asDto() {
    return new EventDto<>("section-updated", this);
  }
}
