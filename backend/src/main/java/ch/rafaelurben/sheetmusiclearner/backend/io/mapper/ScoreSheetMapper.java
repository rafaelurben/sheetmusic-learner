/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.ScoreSheet;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {HelperMapper.class})
public interface ScoreSheetMapper {

  ScoreSheetDto toDto(ScoreSheet scoreSheet);

  List<ScoreSheetDto> toDtoList(List<ScoreSheet> scoreSheets);
}
