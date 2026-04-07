/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.PiecesApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.service.PieceService;
import ch.rafaelurben.sheetmusiclearner.backend.service.UserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PiecesController implements PiecesApi {

  private final PieceService pieceService;
  private final UserService userService;

  @Override
  public List<PieceMetadataDto> getPieces() {
    User user = userService.getCurrentUserEntity();
    return pieceService.getAllAccessiblePieces(user);
  }

  @Override
  public PieceDto createPiece(PieceCreateRequestDto pieceCreateRequestDto) {
    User user = userService.getCurrentUserEntity();
    return pieceService.createPiece(user, pieceCreateRequestDto);
  }

  @Override
  public PieceDto getPiece(UUID id) {
    User user = userService.getCurrentUserEntity();
    return pieceService.getPieceById(user, id);
  }

  @Override
  public void deletePiece(UUID id) {
    User user = userService.getCurrentUserEntity();
    pieceService.deletePiece(user, id);
  }

  @Override
  public List<ScoreSheetDto> uploadScoreSheets(UUID id, List<MultipartFile> files) {
    User user = userService.getCurrentUserEntity();
    return pieceService.uploadScoreSheets(user, id, files);
  }
}
