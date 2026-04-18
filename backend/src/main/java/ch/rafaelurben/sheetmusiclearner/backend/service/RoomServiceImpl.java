/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.*;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChangePieceRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomChatMessageRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomControlPositionRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.RoomMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PiecePermissionRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PieceRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

  private final MessagingService messagingService;
  private final RoomRepository roomRepository;
  private final PieceRepository pieceRepository;
  private final PiecePermissionRepository piecePermissionRepository;
  private final RoomMapper roomMapper;
  private final UserMapper userMapper;

  private Piece getPieceById(final UUID pieceId) {
    return pieceRepository
        .findById(pieceId)
        .orElseThrow(() -> new ObjectNotFoundException("Piece not found"));
  }

  private void ensurePieceReadableByUser(final User user, final Piece piece) {
    if (Boolean.TRUE.equals(piece.getIsPublic())) {
      return;
    }

    boolean hasPermission =
        piecePermissionRepository.existsByPieceIdAndUserId(piece.getId(), user.getId());
    if (!hasPermission) {
      throw new InsufficientPermissionException("You do not have permission to view this piece");
    }
  }

  private Piece getReadablePieceById(final User user, final UUID pieceId) {
    Piece piece = getPieceById(pieceId);
    ensurePieceReadableByUser(user, piece);
    return piece;
  }

  @Override
  public List<RoomMetadataDto> getAllAvailableRooms(final User user) {
    return roomMapper.toMetadataDtoList(roomRepository.findAll());
  }

  @Override
  public RoomDto createRoom(final User user, final RoomCreateRequestDto createRequestDto) {
    Room room = roomMapper.toEntityFromCreateRequest(createRequestDto);
    room.setOwner(user);
    room.setRoomUsers(List.of()); // Ensures roomUsers is not null in DTO
    if (createRequestDto.getPieceId() != null) {
      Piece piece = getReadablePieceById(user, createRequestDto.getPieceId());
      room.setPiece(piece);
    }

    room = roomRepository.save(room);
    RoomMetadataDto roomMetadataDto = roomMapper.toMetadataDto(room);

    messagingService.send(
        Destinations.topicGeneral(), new GeneralRoomNowAvailableEvent(roomMetadataDto).asDto());

    return roomMapper.toDto(room);
  }

  private Room getRoomById(final UUID roomId) {
    return roomRepository
        .findById(roomId)
        .orElseThrow(() -> new ObjectNotFoundException("Room not found"));
  }

  private void ensureUserIsOwner(final User user, final Room room) {
    if (!room.getOwner().getId().equals(user.getId())) {
      throw new InsufficientPermissionException("You are not the owner of the room!");
    }
  }

  @Override
  public RoomDto getRoomById(final User user, final UUID roomId) {
    Room room = getRoomById(roomId);
    return roomMapper.toDto(room);
  }

  @Override
  public void deleteRoom(final User user, final UUID roomId) {
    Room room = getRoomById(roomId);
    ensureUserIsOwner(user, room);

    roomRepository.delete(room);

    messagingService.send(
        Destinations.topicGeneral(), new GeneralRoomNowUnavailableEvent(roomId).asDto());
    messagingService.send(Destinations.topicRoom(roomId), new RoomDeletedEvent().asDto());
  }

  @Override
  public void sendChatMessage(User user, UUID roomId, RoomChatMessageRequestDto dto) {
    getRoomById(roomId); // ensure room exists
    UserDto userDto = userMapper.toDto(user);

    messagingService.send(
        Destinations.topicRoom(roomId),
        new RoomChatMessageEvent(UUID.randomUUID(), userDto, dto.message(), Instant.now()).asDto());
  }

  @Override
  public void changePiece(User user, UUID roomId, RoomChangePieceRequestDto dto) {
    Room room = getRoomById(roomId);
    ensureUserIsOwner(user, room);

    Piece piece = getReadablePieceById(user, dto.pieceId());
    room.setPiece(piece);
    room = roomRepository.save(room);

    RoomMetadataDto roomMetadataDto = roomMapper.toMetadataDto(room);
    messagingService.send(
        Destinations.topicGeneral(), new GeneralRoomMetadataUpdatedEvent(roomMetadataDto).asDto());
    messagingService.send(
        Destinations.topicRoom(roomId), new RoomPieceChangedEvent(piece.getId()).asDto());
  }

  @Override
  public void updateRoom(User user, UUID roomId, RoomUpdateRequestDto updateRequestDto) {
    Room room = getRoomById(roomId);
    ensureUserIsOwner(user, room);

    roomMapper.updateEntityFromUpdateRequest(room, updateRequestDto);
    room = roomRepository.save(room);

    RoomMetadataDto roomMetadataDto = roomMapper.toMetadataDto(room);
    messagingService.send(
        Destinations.topicGeneral(), new GeneralRoomMetadataUpdatedEvent(roomMetadataDto).asDto());
    messagingService.send(
        Destinations.topicRoom(roomId), new RoomMetadataUpdatedEvent(roomMetadataDto).asDto());
  }

  @Override
  public void controlPlay(User user, UUID roomId) {
    Room room = getRoomById(roomId);
    ensureUserIsOwner(user, room);

    room.setPlaying(true);
    room.setLastPlayTimestamp(Instant.now());
    room = roomRepository.save(room);

    messagingService.send(
        Destinations.topicRoom(roomId), RoomPlaybackStateChangedEvent.fromRoom(room).asDto());
  }

  @Override
  public void controlPause(User user, UUID roomId) {
    Room room = getRoomById(roomId);
    ensureUserIsOwner(user, room);

    room.setPlaying(false);
    room = roomRepository.save(room);

    messagingService.send(
        Destinations.topicRoom(roomId), RoomPlaybackStateChangedEvent.fromRoom(room).asDto());
  }

  @Override
  public void controlPosition(User user, UUID roomId, RoomControlPositionRequestDto dto) {
    Room room = getRoomById(roomId);
    ensureUserIsOwner(user, room);

    room.setLastPlaySectionPosition(dto.currentSectionPosition());
    room.setLastPlayTimestamp(Instant.now());
    room = roomRepository.save(room);

    messagingService.send(
        Destinations.topicRoom(roomId), RoomPlaybackStateChangedEvent.fromRoom(room).asDto());
  }
}
