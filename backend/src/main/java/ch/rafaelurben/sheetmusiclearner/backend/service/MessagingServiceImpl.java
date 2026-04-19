/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destination;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.Collection;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingServiceImpl implements MessagingService {
  private final SimpMessagingTemplate template;

  @Override
  public <T> void send(Destination destination, EventDto<T> eventDto) {
    template.convertAndSend(destination.destination(), eventDto);
    log.debug(
        "Sent event {} to destination {}: {}",
        eventDto.payload().getClass().getSimpleName(),
        destination.destination(),
        eventDto);
  }

  @Override
  public <T> void sendToUser(UUID userId, EventDto<T> eventDto) {
    template.convertAndSendToUser(
        userId.toString(), Destinations.USER_QUEUE_NOTIFICATIONS, eventDto);
    log.debug(
        "Sent event {} to user {}: {}",
        eventDto.payload().getClass().getSimpleName(),
        userId,
        eventDto);
  }

  @Override
  public <T> void sendToUsers(Collection<UUID> userIds, EventDto<T> eventDto) {
    for (UUID userId : userIds) {
      template.convertAndSendToUser(
          userId.toString(), Destinations.USER_QUEUE_NOTIFICATIONS, eventDto);
    }
    log.debug(
        "Sent event {} to {} users: {}",
        eventDto.payload().getClass().getSimpleName(),
        userIds.size(),
        eventDto);
  }
}
