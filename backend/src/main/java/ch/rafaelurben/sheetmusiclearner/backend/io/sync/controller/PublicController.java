/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.PublicApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.FrontendConfigDto;
import ch.rafaelurben.sheetmusiclearner.backend.config.FrontendConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PublicController implements PublicApi {

  private final FrontendConfig frontendConfig;

  @Override
  public FrontendConfigDto getFrontendConfig() {
    return frontendConfig.getDto();
  }
}
