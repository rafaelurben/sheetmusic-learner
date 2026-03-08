/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PiecePermissionDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.PiecePermission;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {UserMapper.class})
public interface PiecePermissionMapper {

  PiecePermissionDto toDto(PiecePermission piecePermission);

  List<PiecePermissionDto> toDtoList(List<PiecePermission> piecePermissions);
}
