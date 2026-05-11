/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceHistoryRevisionDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import java.util.List;
import java.util.UUID;

/** Service for viewing and restoring the history of a piece. */
public interface PieceHistoryService {

  List<PieceHistoryRevisionDto> getPieceHistoryById(User user, UUID pieceId);

  PieceDto previewPieceAtRevision(User user, UUID pieceId, Integer revisionId);

  void restorePieceToRevision(User user, UUID pieceId, Integer revisionId);
}
