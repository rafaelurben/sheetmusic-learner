/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto;

import java.util.UUID;

public record PieceMetadataDto(
    UUID id,
    String title,
    String composer,
    String year,
    String description,
    String difficulty,
    String bpmRange,
    Boolean isPublic) {}
