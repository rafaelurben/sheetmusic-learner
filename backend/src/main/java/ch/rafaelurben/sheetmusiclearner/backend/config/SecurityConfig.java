/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import static org.springframework.security.config.Customizer.withDefaults;

import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {
  @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
  private String issuerUri;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) {
    http.oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/api/v1/public/frontend-config")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated());
    return http.build();
  }

  @Bean
  public RestOperations restOperations() {
    log.info("Configuring RestTemplate with 30 second timeouts for OIDC discovery");
    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(Duration.ofSeconds(5));
    requestFactory.setReadTimeout(Duration.ofSeconds(5));
    return new RestTemplate(requestFactory);
  }

  @Bean
  public JwtDecoder jwtDecoder(RestOperations restOperations) {
    log.info("Configuring JwtDecoder with issuer URI: {}", issuerUri);
    try {
      NimbusJwtDecoder decoder =
          NimbusJwtDecoder.withIssuerLocation(issuerUri).restOperations(restOperations).build();
      log.info("JwtDecoder successfully configured");
      return decoder;
    } catch (Exception e) {
      log.error("Failed to configure JwtDecoder with issuer URI: {}", issuerUri, e);
      throw e;
    }
  }
}
