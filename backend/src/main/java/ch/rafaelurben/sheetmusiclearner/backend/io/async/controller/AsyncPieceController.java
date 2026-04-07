/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.controller;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceScoreSheetRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceScoreSheetUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.PieceService;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
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

  private final PieceService pieceService;
  private final UserService userService;

  @MessageMapping("/piece.{pieceId}/update")
  public void handlePieceUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceUpdateRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.updatePiece(user, pieceId, dto);
    log.debug("Updated piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/score-sheet/update")
  public void handleScoreSheetUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceScoreSheetUpdateRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.updateScoreSheet(user, pieceId, dto);
    log.debug("Updated score sheet for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/score-sheet/delete")
  public void handleScoreSheetDelete(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceScoreSheetRemoveRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.removeScoreSheet(user, pieceId, dto);
    log.debug("Deleted score sheet for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/section/add")
  public void handleSectionAdd(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceSectionAddRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.addSection(user, pieceId, dto);
    log.debug("Added section for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/section/update")
  public void handleSectionUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceSectionUpdateRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.updateSection(user, pieceId, dto);
    log.debug("Updated section for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/section/remove")
  public void handleSectionRemove(
      @DestinationVariable UUID pieceId, @Validated @Payload PieceSectionRemoveRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.removeSection(user, pieceId, dto);
    log.debug("Removed section for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/permission/add")
  public void handlePermissionAdd(
      @DestinationVariable UUID pieceId, @Validated @Payload PiecePermissionAddRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.addPermission(user, pieceId, dto);
    log.debug("Added permission for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/permission/update")
  public void handlePermissionUpdate(
      @DestinationVariable UUID pieceId, @Validated @Payload PiecePermissionUpdateRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.updatePermission(user, pieceId, dto);
    log.debug("Updated permission for piece {}: {}", pieceId, dto);
  }

  @MessageMapping("/piece.{pieceId}/permission/remove")
  public void handlePermissionRemove(
      @DestinationVariable UUID pieceId, @Validated @Payload PiecePermissionRemoveRequestDto dto) {
    User user = userService.getCurrentUserEntity();
    pieceService.removePermission(user, pieceId, dto);
    log.debug("Removed permission for piece {}: {}", pieceId, dto);
  }
}
