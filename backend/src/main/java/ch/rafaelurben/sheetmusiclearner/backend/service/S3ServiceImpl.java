/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.config.S3ConfigurationProperties;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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
      PutObjectRequest putRequest =
          PutObjectRequest.builder()
              .bucket(s3Properties.getBucket())
              .key(key)
              .contentType(mediaType)
              .build();

      s3Client.putObject(
          putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

      log.debug("Uploaded score sheet to S3: s3://{}/{}", s3Properties.getBucket(), key);

      return String.format("s3://%s/%s", s3Properties.getBucket(), key);
    } catch (IOException e) {
      throw new BadRequestException("Failed to read file content: " + e.getMessage());
    } catch (Exception e) {
      throw new BadRequestException("Failed to upload file to S3: " + e.getMessage());
    }
  }
}
