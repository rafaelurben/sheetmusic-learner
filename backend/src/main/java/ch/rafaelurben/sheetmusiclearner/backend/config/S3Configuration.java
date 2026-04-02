/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config;

import java.net.URI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@Slf4j
public class S3Configuration {

  @Bean
  public S3Client s3Client(S3ConfigurationProperties properties) {
    String endpoint = properties.getEndpointOverride();
    if (endpoint != null && !endpoint.isBlank()) {
      log.info(
          "Building S3Client with endpoint override! Endpoint: {}",
          properties.getEndpointOverride());
      return S3Client.builder()
          .region(Region.of(properties.getRegion()))
          .endpointOverride(URI.create(properties.getEndpointOverride()))
          .credentialsProvider(
              StaticCredentialsProvider.create(
                  AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey())))
          .forcePathStyle(true)
          .build();
    }

    log.info("Building S3Client without endpoint override! Region: {}", properties.getRegion());
    return S3Client.builder()
        .region(Region.of(properties.getRegion()))
        .credentialsProvider(
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey())))
        .build();
  }
}
