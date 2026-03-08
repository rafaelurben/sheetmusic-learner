/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.async.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.RoomChatMessageEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChatMessageRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AsyncRoomController {

  private final SimpMessagingTemplate template;
  private final UserService userService;

  @MessageMapping("/room.{roomId}/chat")
  public void handleRoomChat(
      @DestinationVariable UUID roomId, @Validated @Payload RoomChatMessageRequestDto dto) {
    UserDto userDto = userService.getCurrentUserDto();

    // TODO: check if room exists and if user is in room

    log.debug(
        "Received chat message from user {} in room {}: {}",
        userDto.getId(),
        roomId,
        dto.message());

    template.convertAndSend(
        Destinations.TOPIC_ROOM.with(roomId),
        new RoomChatMessageEvent(UUID.randomUUID(), userDto, dto.message(), Instant.now()).asDto());
  }
}
