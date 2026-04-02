/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceScoreSheetRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceScoreSheetUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface PieceService {

  List<PieceDto> getAllAccessiblePieces(User user);

  PieceDto createPiece(User user, PieceCreateRequestDto createRequestDto);

  PieceDto getPieceById(User user, UUID pieceId);

  void deletePiece(User user, UUID pieceId);

  void updatePiece(User user, UUID pieceId, PieceUpdateRequestDto updateRequestDto);

  void updateScoreSheet(User user, UUID pieceId, PieceScoreSheetUpdateRequestDto updateRequestDto);

  void removeScoreSheet(User user, UUID pieceId, PieceScoreSheetRemoveRequestDto removeRequestDto);

  void addSection(User user, UUID pieceId, PieceSectionAddRequestDto addRequestDto);

  void updateSection(User user, UUID pieceId, PieceSectionUpdateRequestDto updateRequestDto);

  void removeSection(User user, UUID pieceId, PieceSectionRemoveRequestDto removeRequestDto);

  List<ScoreSheetDto> uploadScoreSheets(User user, UUID pieceId, List<MultipartFile> files);
}
