/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.*;
import ch.rafaelurben.sheetmusiclearner.backend.config.auditing.AuditRevisionListener;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.PieceHistoryRevertedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.PieceMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.ScoreSheetMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.SectionMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import ch.rafaelurben.sheetmusiclearner.backend.model.ScoreSheet;
import ch.rafaelurben.sheetmusiclearner.backend.model.Section;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.model.auditing.AuditRevisionEntry;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PieceRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class PieceHistoryServiceImpl implements PieceHistoryService {

  private final PieceRepository pieceRepository;
  private final UserRepository userRepository;
  private final EntityManager entityManager;
  private final UserMapper userMapper;
  private final PieceMapper pieceMapper;
  private final MessagingService messagingService;
  private final PieceService pieceService;
  private final ScoreSheetMapper scoreSheetMapper;
  private final SectionMapper sectionMapper;

  private List<PieceHistoryRevisionDto> loadHistoryRevisions(final UUID pieceId) {
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    List<Number> revisionNumbers =
        auditReader.getRevisions(Piece.class, pieceId); // ascending (oldest first)
    Map<Number, AuditRevisionEntry> revisionMap =
        auditReader.findRevisions(AuditRevisionEntry.class, new HashSet<>(revisionNumbers));

    Map<UUID, UserDto> userCache = new HashMap<>();

    List<PieceHistoryRevisionDto> history = new ArrayList<>();
    for (Number revisionNumber : revisionNumbers) {
      AuditRevisionEntry auditRevisionEntry = revisionMap.get(revisionNumber);
      UUID userId = auditRevisionEntry.getUserId();

      UserDto userDto =
          userCache.computeIfAbsent(
              userId, id -> userRepository.findById(id).map(userMapper::toDto).orElse(null));

      PieceHistoryRevisionDto dto = new PieceHistoryRevisionDto();
      dto.setRevisionId(revisionNumber.intValue());
      dto.setUser(userDto);
      dto.setTimestamp(Instant.ofEpochMilli(auditRevisionEntry.getTimestamp()).toString());
      dto.setRevisionKind(auditRevisionEntry.getRevisionKind());
      history.add(dto);
    }

    // Sort by revision ID in descending order (most recent first)
    return history.reversed();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PieceHistoryRevisionDto> getPieceHistoryById(User user, UUID pieceId) {
    pieceService.ensureUserPermission(
        user, pieceId, Set.of(PermissionType.EDITOR, PermissionType.OWNER));
    return loadHistoryRevisions(pieceId);
  }

  private Piece getHistoricalPiece(
      final AuditReader auditReader, final UUID pieceId, final Number revisionId) {
    return Optional.ofNullable(auditReader.find(Piece.class, pieceId, revisionId))
        .orElseThrow(
            () ->
                new IllegalArgumentException(
                    "Revision not found: " + revisionId + " for piece: " + pieceId));
  }

  @Override
  @Transactional(readOnly = true)
  public PieceDto previewPieceAtRevision(User user, UUID pieceId, Integer revisionId) {
    pieceService.ensureUserPermission(
        user, pieceId, Set.of(PermissionType.EDITOR, PermissionType.OWNER));

    AuditReader auditReader = AuditReaderFactory.get(entityManager);

    Piece historicalPiece = getHistoricalPiece(auditReader, pieceId, revisionId);
    return pieceMapper.toDto(historicalPiece);
  }

  @Override
  @Transactional
  public void restorePieceToRevision(User user, UUID pieceId, Integer revisionId) {
    pieceService.ensureUserPermission(user, pieceId, Set.of(PermissionType.OWNER));

    AuditReader auditReader = AuditReaderFactory.get(entityManager);

    Piece historicalPiece = getHistoricalPiece(auditReader, pieceId, revisionId);
    Piece currentPiece = pieceRepository.getReferenceById(pieceId);

    AuditRevisionListener.setRevisionKind(RevisionKind.REVERT);
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(
          new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
              AuditRevisionListener.clearRevisionKind();
            }
          });
    }

    try {
      // Clear sections and scoresheets
      currentPiece.getScoreSheets().clear();
      currentPiece.getSections().clear();

      // Restore scoresheets
      Map<UUID, ScoreSheet> restoredScoreSheetByHistoricalId = new HashMap<>();
      for (ScoreSheet historicalScoreSheet : historicalPiece.getScoreSheets()) {
        ScoreSheet newScoreSheet = new ScoreSheet();
        scoreSheetMapper.updateFromHistoricalVersion(newScoreSheet, historicalScoreSheet);
        newScoreSheet.setPiece(currentPiece);
        currentPiece.getScoreSheets().add(newScoreSheet);
        restoredScoreSheetByHistoricalId.put(historicalScoreSheet.getId(), newScoreSheet);
      }

      // Restore sections
      for (Section historicalSection : historicalPiece.getSections()) {
        Section newSection = new Section();
        sectionMapper.updateFromHistoricalVersion(newSection, historicalSection);
        newSection.setPiece(currentPiece);
        if (historicalSection.getScoreSheet() != null) {
          ScoreSheet restoredScoreSheet =
              restoredScoreSheetByHistoricalId.get(historicalSection.getScoreSheet().getId());
          newSection.setScoreSheet(restoredScoreSheet);
        }
        currentPiece.getSections().add(newSection);
      }

      // Finish update and persist piece

      pieceMapper.updateFromHistoricalVersion(currentPiece, historicalPiece);

      entityManager.flush();
    } finally {
      if (!TransactionSynchronizationManager.isSynchronizationActive()) {
        AuditRevisionListener.clearRevisionKind();
      }
    }
    log.info("Piece {} reverted to revision {}", pieceId, revisionId);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceHistoryRevertedEvent(pieceMapper.toDto(currentPiece)).asDto());
  }
}
