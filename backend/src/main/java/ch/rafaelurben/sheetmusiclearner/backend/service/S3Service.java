/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
  String uploadFile(String key, String mediaType, MultipartFile file);
}
