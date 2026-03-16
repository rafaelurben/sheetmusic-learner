/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request;

public record PieceUpdateRequestDto(
    String title, String composer, String difficulty, String bpmRange, Boolean isPublic) {}
