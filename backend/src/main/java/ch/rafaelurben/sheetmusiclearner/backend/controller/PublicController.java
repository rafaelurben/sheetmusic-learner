/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.PublicApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.FrontendConfigDto;
import ch.rafaelurben.sheetmusiclearner.backend.config.FrontendConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PublicController implements PublicApi {

  private final FrontendConfig frontendConfig;

  @Override
  public FrontendConfigDto getFrontendConfig() {
    return frontendConfig.getDto();
  }
}
