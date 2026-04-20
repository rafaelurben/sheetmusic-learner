/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record RoomControlPlaybackConfigRequestDto(
    @NotNull @DecimalMin("0.01") @DecimalMax("10.0") Float tempoMultiplier) {}
