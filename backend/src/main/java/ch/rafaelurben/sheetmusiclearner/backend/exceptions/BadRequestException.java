/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.exceptions;

public class BadRequestException extends RuntimeException {
  public BadRequestException(String message) {
    super(message);
  }
}
