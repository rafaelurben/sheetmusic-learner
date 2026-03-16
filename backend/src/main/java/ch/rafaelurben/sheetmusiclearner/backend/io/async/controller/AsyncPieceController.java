/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.controller;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.NotImplementedException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AsyncPieceController {

  @MessageMapping("/piece.{pieceId}/update")
  public void handlePieceUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceUpdateRequestDto dto) {
    log.debug("Received piece update for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Piece update is not implemented yet");
  }

  @MessageMapping("/piece.{pieceId}/section/add")
  public void handleSectionAdd(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceSectionAddRequestDto dto) {
    log.debug("Received section add for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Section add is not implemented yet");
  }

  @MessageMapping("/piece.{pieceId}/section/update")
  public void handleSectionUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceSectionUpdateRequestDto dto) {
    log.debug("Received section update for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Section update is not implemented yet");
  }

  @MessageMapping("/piece.{pieceId}/section/remove")
  public void handleSectionRemove(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceSectionRemoveRequestDto dto) {
    log.debug("Received section remove for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Section remove is not implemented yet");
  }

  @MessageMapping("/piece.{pieceId}/permission/add")
  public void handlePermissionAdd(
      @DestinationVariable UUID pieceId, @Validated @Payload PiecePermissionAddRequestDto dto) {
    log.debug("Received permission add for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Permission add is not implemented yet");
  }

  @MessageMapping("/piece.{pieceId}/permission/update")
  public void handlePermissionUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PiecePermissionUpdateRequestDto dto) {
    log.debug("Received permission update for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Permission update is not implemented yet");
  }

  @MessageMapping("/piece.{pieceId}/permission/remove")
  public void handlePermissionRemove(
      @DestinationVariable UUID pieceId, @Validated @Payload PiecePermissionRemoveRequestDto dto) {
    log.debug("Received permission remove for piece {}: {}", pieceId, dto);
    throw new NotImplementedException("Permission remove is not implemented yet");
  }
}
