/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import java.util.Collection;
import java.util.UUID;

/** Service for outgoing async STOMP messages/events. */
public interface MessagingService {
  /** Send an event to a topic with the specified destination. */
  <T> void send(Destination destination, EventDto<T> eventDto);

  /** Send an event to a specific user. */
  <T> void sendToUser(UUID userId, EventDto<T> eventDto);

  /** Send an event to multiple users. */
  <T> void sendToUsers(Collection<UUID> userIds, EventDto<T> eventDto);
}
