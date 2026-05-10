/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event;

/** DTO for asynchronous events of any kind. */
public record EventDto<T>(String type, T payload) {}
