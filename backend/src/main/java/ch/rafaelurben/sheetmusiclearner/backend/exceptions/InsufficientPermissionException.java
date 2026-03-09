/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.exceptions;

public class InsufficientPermissionException extends RuntimeException {
  public InsufficientPermissionException(String message) {
    super(message);
  }
}
