/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

import java.util.UUID;

public record PieceSectionRemovedEvent(UUID sectionId) {

  public EventDto<PieceSectionRemovedEvent> asDto() {
    return new EventDto<>("section-removed", this);
  }
}
