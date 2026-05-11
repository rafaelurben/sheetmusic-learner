/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static org.junit.jupiter.api.Assertions.*;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.*;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.PieceHistoryRevertedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.model.*;
import ch.rafaelurben.sheetmusiclearner.backend.repository.*;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.BaseSpringBootTest;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.TestUsers;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import jakarta.persistence.EntityManager;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.envers.AuditReaderFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

class PieceHistoryServiceTest extends BaseSpringBootTest {

  @Autowired private PieceHistoryServiceImpl pieceHistoryService;
  @Autowired private PieceRepository pieceRepository;
  @Autowired private ScoreSheetRepository scoreSheetRepository;
  @Autowired private SectionRepository sectionRepository;
  @Autowired private PiecePermissionRepository piecePermissionRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private EntityManager entityManager;
  @Autowired private PlatformTransactionManager transactionManager;

  @Test
  void restorePieceToRevisionRestoresPieceSectionsAndScoreSheetsButKeepsPermissions() {
    User owner = persistUser("owner");
    User editor = persistUser("editor");
    Piece originalPiece = persistOriginalPieceGraph();
    persistPermission(originalPiece, owner, PermissionType.OWNER);
    persistPermission(originalPiece, editor, PermissionType.EDITOR);

    UUID pieceId = originalPiece.getId();
    Integer originalRevision =
        new TransactionTemplate(transactionManager)
            .execute(
                ignored ->
                    AuditReaderFactory.get(entityManager)
                        .getRevisions(Piece.class, pieceId)
                        .stream()
                        .findFirst()
                        .orElseThrow()
                        .intValue());

    entityManager.clear();

    new TransactionTemplate(transactionManager)
        .executeWithoutResult(
            ignored -> {
              Piece mutatedPiece = pieceRepository.findById(pieceId).orElseThrow();
              ScoreSheet mutatedScoreSheet =
                  scoreSheetRepository.findAllByPieceIdOrderByPositionAsc(pieceId).getFirst();
              Section mutatedSection =
                  sectionRepository.findAllByPieceIdOrderByPositionAsc(pieceId).getFirst();

              mutatedPiece.setTitle("Changed title");
              mutatedPiece.setComposer("Changed composer");
              mutatedPiece.setYear("2025");
              mutatedPiece.setDescription("Changed description");
              mutatedPiece.setDifficulty("Hard");
              mutatedPiece.setBpmRange("90-110");
              mutatedPiece.setIsPublic(true);

              mutatedScoreSheet.setTitle("Changed sheet title");
              mutatedScoreSheet.setPosition(7);
              mutatedScoreSheet.setS3Key("changed-s3-key");
              mutatedScoreSheet.setImageUrl("https://example.test/changed-sheet.png");

              mutatedSection.setName("Changed section name");
              mutatedSection.setPosition(3);
              mutatedSection.setBpm(96);
              mutatedSection.setScoreSheet(mutatedScoreSheet);

              entityManager.flush();
            });

    entityManager.clear();

    PieceDto preRestorePreview =
        pieceHistoryService.previewPieceAtRevision(owner, pieceId, originalRevision);

    assertDoesNotThrow(
        () -> pieceHistoryService.restorePieceToRevision(owner, pieceId, originalRevision));

    entityManager.clear();

    PieceDto postRestorePreview =
        pieceHistoryService.previewPieceAtRevision(owner, pieceId, originalRevision);

    Piece restoredPiece = pieceRepository.findById(pieceId).orElseThrow();
    List<ScoreSheet> restoredScoreSheets =
        scoreSheetRepository.findAllByPieceIdOrderByPositionAsc(pieceId);
    List<Section> restoredSections = sectionRepository.findAllByPieceIdOrderByPositionAsc(pieceId);

    try {
      assertPreviewPieceContent(preRestorePreview, pieceId);
      assertEquals(preRestorePreview, postRestorePreview);
      assertRestoredPiece(restoredPiece);
      assertRestoredChildren(restoredScoreSheets, restoredSections);
      assertPermissionsPreserved(pieceId, owner.getId(), editor.getId());
      assertRevertEvent(pieceId);
      assertHistoryRevisionKinds(pieceId, owner);
    } finally {
      entityManager.clear();
      new TransactionTemplate(transactionManager)
          .executeWithoutResult(
              ignored -> {
                Piece pieceToDelete = pieceRepository.findById(pieceId).orElseThrow();
                pieceRepository.delete(pieceToDelete);
                pieceRepository.flush();
              });
    }
  }

  private void assertRestoredPiece(Piece restoredPiece) {
    assertAll(
        () -> assertEquals("Original title", restoredPiece.getTitle()),
        () -> assertEquals("Original composer", restoredPiece.getComposer()),
        () -> assertEquals("2026", restoredPiece.getYear()),
        () -> assertEquals("Original description", restoredPiece.getDescription()),
        () -> assertEquals("Easy", restoredPiece.getDifficulty()),
        () -> assertEquals("60-80", restoredPiece.getBpmRange()),
        () -> assertTrue(restoredPiece.isPublic()));
  }

  private void assertRestoredChildren(
      List<ScoreSheet> restoredScoreSheets, List<Section> restoredSections) {
    assertAll(
        () -> assertEquals(1, restoredScoreSheets.size()),
        () -> assertEquals(1, restoredSections.size()));

    ScoreSheet restoredScoreSheet = restoredScoreSheets.getFirst();
    Section restoredSection = restoredSections.getFirst();

    assertAll(
        () -> assertEquals("Original sheet title", restoredScoreSheet.getTitle()),
        () -> assertEquals(0, restoredScoreSheet.getPosition()),
        () -> assertEquals("original-s3-key", restoredScoreSheet.getS3Key()),
        () ->
            assertEquals(
                "https://example.test/original-sheet.png", restoredScoreSheet.getImageUrl()),
        () -> assertEquals("Original section", restoredSection.getName()),
        () -> assertEquals(0, restoredSection.getPosition()),
        () -> assertEquals(4, restoredSection.getTimeSignatureNumerator()),
        () -> assertEquals(4, restoredSection.getTimeSignatureDenominator()),
        () -> assertEquals(8, restoredSection.getBarCount()),
        () -> assertEquals(120, restoredSection.getBpm()),
        () -> assertEquals(restoredScoreSheet.getId(), restoredSection.getScoreSheet().getId()));
  }

  private void assertPermissionsPreserved(UUID pieceId, UUID ownerId, UUID editorId) {
    assertAll(
        () -> assertEquals(PermissionType.OWNER, getPermission(pieceId, ownerId)),
        () -> assertEquals(PermissionType.EDITOR, getPermission(pieceId, editorId)));
  }

  private void assertRevertEvent(UUID pieceId) {
    getMessageAsserter()
        .assertSend(
            Destinations.topicPiece(pieceId),
            PieceHistoryRevertedEvent.class,
            payload -> assertEquals(pieceId, payload.piece().getId()));
  }

  private void assertHistoryRevisionKinds(UUID pieceId, User owner) {
    List<PieceHistoryRevisionDto> history = pieceHistoryService.getPieceHistoryById(owner, pieceId);

    assertAll(
        () -> assertEquals(3, history.size()),
        () -> assertEquals(RevisionKind.REVERT, history.getFirst().getRevisionKind()),
        () -> assertEquals(RevisionKind.DEFAULT, history.get(1).getRevisionKind()),
        () -> assertEquals(RevisionKind.DEFAULT, history.getLast().getRevisionKind()));
  }

  private void assertPreviewPieceContent(PieceDto preview, UUID pieceId) {
    assertAll(
        () -> assertEquals(pieceId, preview.getId()),
        () -> assertEquals("Original title", preview.getTitle()),
        () -> assertEquals("Original composer", preview.getComposer()),
        () -> assertEquals("2026", preview.getYear()),
        () -> assertEquals("Original description", preview.getDescription()),
        () -> assertEquals("Easy", preview.getDifficulty()),
        () -> assertEquals("60-80", preview.getBpmRange()),
        () -> assertFalse(preview.getIsPublic()),
        () -> assertEquals(1, preview.getScoreSheets().size()),
        () -> assertEquals(1, preview.getSections().size()));

    assertPreviewScoreSheet(preview);
    assertPreviewSection(preview);
  }

  private void assertPreviewScoreSheet(PieceDto preview) {
    ScoreSheetDto previewScoreSheet = preview.getScoreSheets().getFirst();

    assertAll(
        () -> assertEquals(0, previewScoreSheet.getPosition()),
        () -> assertEquals("Original sheet title", previewScoreSheet.getTitle()),
        () ->
            assertEquals(
                URI.create("https://example.test/original-sheet.png"),
                previewScoreSheet.getImageUrl()));
  }

  private void assertPreviewSection(PieceDto preview) {
    SectionDto previewSection = preview.getSections().getFirst();

    assertAll(
        () -> assertEquals(0, previewSection.getPosition()),
        () -> assertEquals("Original section", previewSection.getName()),
        () -> assertEquals(4, previewSection.getTimeSignatureNumerator()),
        () -> assertEquals(4, previewSection.getTimeSignatureDenominator()),
        () -> assertEquals(8, previewSection.getBarCount()),
        () -> assertEquals(120, previewSection.getBpm()),
        () -> assertEquals(0.1f, previewSection.getPosX1(), 0.0001f),
        () -> assertEquals(0.2f, previewSection.getPosY1(), 0.0001f),
        () -> assertEquals(0.3f, previewSection.getPosX2(), 0.0001f),
        () -> assertEquals(0.4f, previewSection.getPosY2(), 0.0001f));
  }

  private User persistUser(String label) {
    User user = TestUsers.createUser(UUID.randomUUID());
    user.setFirstName(label);
    user.setLastName(label);
    return userRepository.saveAndFlush(user);
  }

  private Piece persistOriginalPieceGraph() {
    Piece piece =
        Piece.builder()
            .title("Original title")
            .composer("Original composer")
            .year("2026")
            .description("Original description")
            .difficulty("Easy")
            .bpmRange("60-80")
            .isPublic(false)
            .build();

    ScoreSheet scoreSheet =
        ScoreSheet.builder()
            .title("Original sheet title")
            .position(0)
            .s3Key("original-s3-key")
            .imageUrl("https://example.test/original-sheet.png")
            .build();

    Section section =
        Section.builder()
            .position(0)
            .name("Original section")
            .timeSignatureNumerator(4)
            .timeSignatureDenominator(4)
            .barCount(8)
            .bpm(120)
            .posX1(0.1f)
            .posY1(0.2f)
            .posX2(0.3f)
            .posY2(0.4f)
            .build();

    piece.setScoreSheets(new ArrayList<>(List.of(scoreSheet)));
    piece.setSections(new ArrayList<>(List.of(section)));
    scoreSheet.setPiece(piece);
    section.setPiece(piece);
    section.setScoreSheet(scoreSheet);

    return pieceRepository.saveAndFlush(piece);
  }

  private void persistPermission(Piece piece, User user, PermissionType permissionType) {
    piecePermissionRepository.saveAndFlush(
        PiecePermission.builder().piece(piece).user(user).permissionType(permissionType).build());
  }

  private PermissionType getPermission(UUID pieceId, UUID userId) {
    return piecePermissionRepository
        .findByPieceIdAndUserId(pieceId, userId)
        .orElseThrow()
        .getPermissionType();
  }
}
