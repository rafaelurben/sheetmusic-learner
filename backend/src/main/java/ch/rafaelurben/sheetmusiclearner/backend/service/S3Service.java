/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import org.springframework.web.multipart.MultipartFile;

/** Service for managing files in S3 storage. */
public interface S3Service {

  /**
   * Upload a file to S3.
   *
   * @return the public URL of the uploaded file.
   */
  String uploadFile(String key, String mediaType, MultipartFile file);

  /** Delete a file in S3. */
  void deleteFile(String key);
}
