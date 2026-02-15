/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.FrontendConfigDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.FrontendConfigDtoOidc;
import java.net.URI;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class FrontendConfig {
  @Value("${app.oidc.client-id}")
  private String oidcClientId;

  @Value("${app.oidc.issuer}")
  private URI oidcIssuer;

  @Value("${app.oidc.scope}")
  private String oidcScope;

  public FrontendConfigDto getDto() {
    return FrontendConfigDto.builder()
        .oidc(
            FrontendConfigDtoOidc.builder()
                .clientId(oidcClientId)
                .issuer(oidcIssuer)
                .scope(oidcScope)
                .build())
        .build();
  }
}
