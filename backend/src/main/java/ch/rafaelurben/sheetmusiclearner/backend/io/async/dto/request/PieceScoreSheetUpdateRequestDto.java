/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request;

import java.util.UUID;

public record PieceScoreSheetUpdateRequestDto(UUID scoreSheetId, String title, Integer position) {}
