/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.ScoreSheet;
import java.util.List;
import org.mapstruct.*;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT,
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {HelperMapper.class})
public interface ScoreSheetMapper {

  ScoreSheetDto toDto(ScoreSheet scoreSheet);

  List<ScoreSheetDto> toDtoList(List<ScoreSheet> scoreSheets);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "piece", ignore = true)
  @Mapping(target = "timestampCreated", ignore = true)
  @Mapping(target = "timestampUpdated", ignore = true)
  void updateFromHistoricalVersion(
      @MappingTarget ScoreSheet scoreSheet, ScoreSheet historicalScoreSheet);
}
