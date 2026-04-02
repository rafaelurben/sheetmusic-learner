/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request;

import java.util.UUID;

public record PieceSectionAddRequestDto(
    int position,
    int timeSignatureNumerator,
    int timeSignatureDenominator,
    int barCount,
    int bpm,
    UUID scoreSheetId,
    Float posX1,
    Float posY1,
    Float posX2,
    Float posY2) {}
