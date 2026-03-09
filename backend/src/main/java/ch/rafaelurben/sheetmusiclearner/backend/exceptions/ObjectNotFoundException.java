/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.exceptions;

public class ObjectNotFoundException extends RuntimeException {
  public ObjectNotFoundException(String message) {
    super(message);
  }
}
