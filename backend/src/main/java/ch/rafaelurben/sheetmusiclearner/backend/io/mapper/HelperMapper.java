/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import java.net.URI;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.openapitools.jackson.nullable.JsonNullable;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
interface HelperMapper {
  default <Z> Z convertNullable(JsonNullable<Z> source) {
    return source.get();
  }

  default <Z> JsonNullable<Z> convertNullable(Z source) {
    if (source == null) {
      return JsonNullable.undefined();
    }

    return JsonNullable.of(source);
  }

  default URI convertURI(String avatarUrl) {
    if (avatarUrl == null || avatarUrl.isBlank()) {
      return null;
    }
    return URI.create(avatarUrl);
  }
}
