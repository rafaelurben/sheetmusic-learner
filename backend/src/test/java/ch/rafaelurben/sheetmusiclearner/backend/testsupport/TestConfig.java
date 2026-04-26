/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import static org.mockito.Mockito.mock;

import java.util.UUID;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import software.amazon.awssdk.services.s3.S3Client;

@TestConfiguration
public class TestConfig {

  @Bean
  @Primary
  public JwtDecoder jwtDecoder() {
    return token ->
        Jwt.withTokenValue(token)
            .header("alg", "none")
            .claim("sub", UUID.randomUUID().toString())
            .build();
  }

  @Bean
  @Primary
  public S3Client s3Client() {
    return mock(S3Client.class);
  }
}
