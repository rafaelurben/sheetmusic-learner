/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** Helper class to read S3-related application properties. */
@Component
@ConfigurationProperties(prefix = "app.s3")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class S3ConfigurationProperties {

  private String region = "eu-central-1";
  private String accessKey;
  private String secretKey;
  private String bucket = "sheetmusic-learner-scores";
  private String endpointOverride;
  private String publicBaseUrl;
}
