/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.controller;

import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChangePieceRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChatMessageRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomControlPositionRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.RoomService;
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
public class AsyncRoomController {

  private final UserService userService;
  private final RoomService roomService;

  @MessageMapping("/room.{roomId}/chat")
  public void handleRoomChat(
      @DestinationVariable UUID roomId, @Validated @Payload RoomChatMessageRequestDto dto) {
    User user = userService.getCurrentUserEntity();

    log.debug(
        "Received chat message from user {} in room {}: {}", user.getId(), roomId, dto.message());

    roomService.sendChatMessage(user, roomId, dto);
  }

  @MessageMapping("/room.{roomId}/update")
  public void handleRoomUpdate(
      @DestinationVariable UUID roomId, @Validated @Payload RoomUpdateRequestDto dto) {
    User user = userService.getCurrentUserEntity();

    log.debug("Received room update for room {}: {}", roomId, dto);

    roomService.updateRoom(user, roomId, dto);
  }

  @MessageMapping("/room.{roomId}/change-piece")
  public void handleChangePiece(
      @DestinationVariable UUID roomId, @Validated @Payload RoomChangePieceRequestDto dto) {
    User user = userService.getCurrentUserEntity();

    log.debug("Received change-piece for room {}: {}", roomId, dto);

    roomService.changePiece(user, roomId, dto);
  }

  @MessageMapping("/room.{roomId}/control/play")
  public void handleControlPlay(@DestinationVariable UUID roomId) {
    log.debug("Received control/play for room {}", roomId);
    User user = userService.getCurrentUserEntity();

    roomService.controlPlay(user, roomId);
  }

  @MessageMapping("/room.{roomId}/control/pause")
  public void handleControlPause(@DestinationVariable UUID roomId) {
    log.debug("Received control/pause for room {}", roomId);
    User user = userService.getCurrentUserEntity();

    roomService.controlPause(user, roomId);
  }

  @MessageMapping("/room.{roomId}/control/position")
  public void handleControlPosition(
      @DestinationVariable UUID roomId, @Validated @Payload RoomControlPositionRequestDto dto) {
    log.debug("Received control/position for room {}: {}", roomId, dto);
    User user = userService.getCurrentUserEntity();

    roomService.controlPosition(user, roomId, dto);
  }
}
