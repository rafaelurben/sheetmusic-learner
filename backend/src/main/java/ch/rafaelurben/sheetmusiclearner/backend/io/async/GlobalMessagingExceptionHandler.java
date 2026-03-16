/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.NotImplementedException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.EventDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.UserErrorEvent;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.ControllerAdvice;

@Slf4j
@ControllerAdvice(basePackages = "ch.rafaelurben.sheetmusiclearner.backend.io.async.controller")
public class GlobalMessagingExceptionHandler {

  @MessageExceptionHandler(BadRequestException.class)
  @SendToUser(Destinations.USER_QUEUE_NOTIFICATIONS)
  public EventDto<UserErrorEvent> handleBadRequestException(BadRequestException ex) {
    log.debug("Handling Bad Request Exception", ex);
    return new UserErrorEvent("Bad request", ex.getMessage()).asDto();
  }

  @MessageExceptionHandler(InsufficientPermissionException.class)
  @SendToUser(Destinations.USER_QUEUE_NOTIFICATIONS)
  public EventDto<UserErrorEvent> handleInsufficientPermissionException(
      InsufficientPermissionException ex) {
    log.debug("Handling Insufficient Permission Exception", ex);
    return new UserErrorEvent("Insufficient permissions", ex.getMessage()).asDto();
  }

  @MessageExceptionHandler(ObjectNotFoundException.class)
  @SendToUser(Destinations.USER_QUEUE_NOTIFICATIONS)
  public EventDto<UserErrorEvent> handleObjectNotFoundException(ObjectNotFoundException ex) {
    log.debug("Handling Object Not Found Exception", ex);
    return new UserErrorEvent("Object not found", ex.getMessage()).asDto();
  }

  @MessageExceptionHandler(NotImplementedException.class)
  @SendToUser(Destinations.USER_QUEUE_NOTIFICATIONS)
  public EventDto<UserErrorEvent> handleNotImplementedException(NotImplementedException ex) {
    log.debug("Handling Not Implemented Exception", ex);
    return new UserErrorEvent("Not implemented", ex.getMessage()).asDto();
  }

  @MessageExceptionHandler(Exception.class)
  @SendToUser(Destinations.USER_QUEUE_NOTIFICATIONS)
  public EventDto<UserErrorEvent> handleException(RuntimeException ex) {
    log.debug("Handling RuntimeException", ex);
    return new UserErrorEvent("Interner Serverfehler", ex.getClass().getSimpleName()).asDto();
  }
}
