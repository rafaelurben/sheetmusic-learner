/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.*;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

/** Service for all piece-related requests. */
public interface PieceService {

  /** Get all pieces that are readable by a specific user. */
  List<PieceMetadataDto> getAllAccessiblePieces(User user);

  /**
   * Ensure that a piece is readable by a specific user, otherwise throw an {@link
   * InsufficientPermissionException}.
   */
  void ensureReadableByUser(UUID userId, UUID pieceId);

  PieceDto createPiece(User user, PieceCreateRequestDto createRequestDto);

  PieceDto getPieceById(User user, UUID pieceId);

  void deletePiece(User user, UUID pieceId);

  void updatePiece(User user, UUID pieceId, PieceUpdateRequestDto updateRequestDto);

  void updateScoreSheet(User user, UUID pieceId, PieceScoreSheetUpdateRequestDto updateRequestDto);

  void removeScoreSheet(User user, UUID pieceId, PieceScoreSheetRemoveRequestDto removeRequestDto);

  void addSection(User user, UUID pieceId, PieceSectionAddRequestDto addRequestDto);

  void updateSection(User user, UUID pieceId, PieceSectionUpdateRequestDto updateRequestDto);

  void removeSection(User user, UUID pieceId, PieceSectionRemoveRequestDto removeRequestDto);

  void addPermission(User user, UUID pieceId, PiecePermissionAddRequestDto addRequestDto);

  void updatePermission(User user, UUID pieceId, PiecePermissionUpdateRequestDto updateRequestDto);

  void removePermission(User user, UUID pieceId, PiecePermissionRemoveRequestDto removeRequestDto);

  List<ScoreSheetDto> uploadScoreSheets(User user, UUID pieceId, List<MultipartFile> files);
}
