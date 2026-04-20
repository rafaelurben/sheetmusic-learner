/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChangePieceRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChatMessageRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomControlPlaybackConfigRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomControlPositionRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import java.util.List;
import java.util.UUID;

public interface RoomService {

  List<RoomMetadataDto> getAllAvailableRooms(User user);

  RoomDto createRoom(User user, RoomCreateRequestDto createRequestDto);

  RoomDto getRoomById(User user, UUID roomId);

  void deleteRoom(User user, UUID roomId);

  void sendChatMessage(User user, UUID roomId, RoomChatMessageRequestDto dto);

  void changePiece(User user, UUID roomId, RoomChangePieceRequestDto dto);

  void updateRoom(User user, UUID roomId, RoomUpdateRequestDto updateRequestDto);

  void controlPlay(User user, UUID roomId);

  void controlPause(User user, UUID roomId);

  void controlPosition(User user, UUID roomId, RoomControlPositionRequestDto dto);

  void controlPlaybackConfig(User user, UUID roomId, RoomControlPlaybackConfigRequestDto dto);
}
