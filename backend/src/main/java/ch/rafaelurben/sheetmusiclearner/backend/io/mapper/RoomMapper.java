/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RoomMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.UserDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.RoomUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {HelperMapper.class})
public interface RoomMapper {

  @Mapping(source = "owner.id", target = "ownerId")
  @Mapping(source = "piece.id", target = "pieceId")
  RoomDto toDto(Room room);

  @Mapping(source = "owner.id", target = "ownerId")
  @Mapping(source = "piece.id", target = "pieceId")
  RoomMetadataDto toMetadataDto(Room room);

  List<RoomMetadataDto> toMetadataDtoList(List<Room> rooms);

  Room toEntityFromCreateRequest(RoomCreateRequestDto createRequestDto);

  void updateEntityFromUpdateRequest(
      @MappingTarget Room room, RoomUpdateRequestDto updateRequestDto);

  @Mapping(source = "user", target = ".")
  UserDto roomUserToUserDto(RoomUser roomUser);
}
