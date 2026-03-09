/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.io.sync.controller;

import ch.rafaelurben.sheetmusiclearner.backend.api.controller.PiecesApi;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.NotImplementedException;
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

  @Override
  public List<PieceDto> getPieces() {
    throw new NotImplementedException("Not supported yet.");
  }

  @Override
  public PieceDto createPiece(PieceCreateRequestDto pieceCreateRequestDto) {
    throw new NotImplementedException("Not supported yet.");
  }

  @Override
  public PieceDto getPiece(UUID id) {
    throw new NotImplementedException("Not supported yet.");
  }

  @Override
  public void deletePiece(UUID id) {
    throw new NotImplementedException("Not supported yet.");
  }

  @Override
  public List<ScoreSheetDto> uploadScoreSheets(UUID id, List<MultipartFile> files) {
    throw new NotImplementedException("Not supported yet.");
  }
}
