/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.mapper;

import java.net.URI;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
interface HelperMapper {
  default URI convertURI(String string) {
    if (string == null || string.isBlank()) {
      return null;
    }
    return URI.create(string);
  }
}
