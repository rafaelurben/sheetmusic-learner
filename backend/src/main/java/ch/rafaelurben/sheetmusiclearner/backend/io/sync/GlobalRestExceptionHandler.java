/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.NotImplementedException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalRestExceptionHandler {

  @ExceptionHandler(BadRequestException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String handleBadRequestException(BadRequestException ex) {
    return ex.getMessage();
  }

  @ExceptionHandler(InsufficientPermissionException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public String handleInsufficientPermissionException(InsufficientPermissionException ex) {
    return ex.getMessage();
  }

  @ExceptionHandler(ObjectNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public String handleObjectNotFoundException(ObjectNotFoundException ex) {
    return ex.getMessage();
  }

  @ExceptionHandler(NotImplementedException.class)
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  public String handleNotImplementedException(NotImplementedException ex) {
    return ex.getMessage();
  }
}
