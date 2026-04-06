/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.config.S3ConfigurationProperties;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {
  private final S3ConfigurationProperties s3Properties;
  private final S3Client s3Client;

  @PostConstruct
  private void init() {
    // Ensure bucket exists
    log.info("Checking connection to S3...");
    s3Client.headBucket(builder -> builder.bucket(s3Properties.getBucket()));
    log.info("S3 Bucket successfully reached!");
  }

  @Override
  public String uploadFile(final String key, final String mediaType, final MultipartFile file) {
    try {
      s3Client.putObject(
          d -> d.bucket(s3Properties.getBucket()).key(key).contentType(mediaType),
          RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

      log.debug("Uploaded score sheet to S3: s3://{}/{}", s3Properties.getBucket(), key);

      return String.format(
          "%s/%s/%s", resolvePublicBaseUrl(), s3Properties.getBucket(), trimLeadingSlash(key));
    } catch (IOException e) {
      throw new BadRequestException("Failed to read file content: " + e.getMessage());
    }
  }

  @Override
  public void deleteFile(final String key) {
    s3Client.deleteObject(b -> b.bucket(s3Properties.getBucket()).key(key));
  }

  private String resolvePublicBaseUrl() {
    String baseUrl = s3Properties.getPublicBaseUrl();
    if (!StringUtils.hasText(baseUrl)) {
      baseUrl = s3Properties.getEndpointOverride();
    }
    if (!StringUtils.hasText(baseUrl)) {
      baseUrl = String.format("https://s3.%s.amazonaws.com", s3Properties.getRegion());
    }
    return trimTrailingSlash(baseUrl);
  }

  private String trimLeadingSlash(String value) {
    return value != null && value.startsWith("/") ? value.substring(1) : value;
  }

  private String trimTrailingSlash(String value) {
    return value != null && value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }
}
