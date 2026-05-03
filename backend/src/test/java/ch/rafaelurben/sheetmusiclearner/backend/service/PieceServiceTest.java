/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static org.junit.jupiter.api.Assertions.*;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.GeneralPieceMetadataUpdatedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.GeneralPieceNowAvailableEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.GeneralPieceNowUnavailableEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.PieceMetadataUpdatedEvent;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import ch.rafaelurben.sheetmusiclearner.backend.model.PiecePermission;
import ch.rafaelurben.sheetmusiclearner.backend.model.Room;
import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PiecePermissionRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PieceRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomUserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.BaseSpringBootTest;
import ch.rafaelurben.sheetmusiclearner.backend.testsupport.TestUsers;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PieceServiceTest extends BaseSpringBootTest {

  @Autowired private PieceRepository pieceRepository;
  @Autowired private PiecePermissionRepository piecePermissionRepository;
  @Autowired private RoomRepository roomRepository;
  @Autowired private RoomUserRepository roomUserRepository;
  @Autowired private UserRepository userRepository;

  @Autowired private PieceServiceImpl pieceService;

  @Test
  void testGetAllAvailablePieces() {
    User user = persistUser();
    User user2 = persistUser();

    // Piece A: public
    Piece pieceA = persistPiece(true);
    // Piece B: private with permission
    Piece pieceB = persistPiece(false);
    persistPermission(pieceB, user, PermissionType.EDITOR);
    // Piece C: public
    Piece pieceC = persistPiece(true);
    // Piece D: private without permission
    Piece pieceD = persistPiece(false);
    persistPermission(pieceD, user2, PermissionType.OWNER);

    var result = pieceService.getAllAccessiblePieces(user);

    Set<UUID> actualIds = result.stream().map(PieceMetadataDto::getId).collect(Collectors.toSet());
    assertEquals(Set.of(pieceA.getId(), pieceB.getId(), pieceC.getId()), actualIds);
  }

  @Test
  void testEnsureReadableByUserPublicPieceDoesNotThrow() {
    User user = persistUser();
    Piece piece = persistPiece(true);

    assertDoesNotThrow(() -> pieceService.ensureReadableByUser(user.getId(), piece.getId()));
  }

  @Test
  void testEnsureReadableByUserPrivatePieceWithPermissionDoesNotThrow() {
    User user = persistUser();
    Piece piece = persistPiece(false);
    persistPermission(piece, user, PermissionType.READER);

    assertDoesNotThrow(() -> pieceService.ensureReadableByUser(user.getId(), piece.getId()));
  }

  @Test
  void testEnsureReadableByUserPrivatePieceWithRoomMembershipDoesNotThrow() {
    User user = persistUser();
    User owner = persistUser();
    Piece piece = persistPiece(false);

    Room room =
        roomRepository.saveAndFlush(
            Room.builder().title("Room").owner(owner).piece(piece).roomUsers(List.of()).build());
    persistRoomUser(room, user);

    assertDoesNotThrow(() -> pieceService.ensureReadableByUser(user.getId(), piece.getId()));
  }

  @Test
  void testEnsureReadableByUserPrivatePieceNoPermissionThrows() {
    User user = persistUser();
    Piece piece = persistPiece(false);
    UUID userId = user.getId();
    UUID pieceId = piece.getId();

    assertThrows(
        InsufficientPermissionException.class,
        () -> pieceService.ensureReadableByUser(userId, pieceId));
  }

  @Test
  void testCreatePiecePublic() {
    User user = persistUser();
    PieceCreateRequestDto createRequestDto = createPieceCreateRequest(true);

    var created = pieceService.createPiece(user, createRequestDto);

    PieceDto piece = pieceService.getPieceById(user, created.getId());
    assertTrue(piece.getIsPublic());
    assertEquals(createRequestDto.getTitle(), piece.getTitle());

    PiecePermission permission =
        piecePermissionRepository
            .findByPieceIdAndUserId(created.getId(), user.getId())
            .orElseThrow();
    assertEquals(PermissionType.OWNER, permission.getPermissionType());

    getMessageAsserter()
        .assertSend(
            Destinations.topicGeneral(),
            GeneralPieceNowAvailableEvent.class,
            payload -> assertEquals(created.getId(), payload.piece().getId()));
  }

  @Test
  void testCreatePiecePrivate() {
    User user = persistUser();
    PieceCreateRequestDto createRequestDto = createPieceCreateRequest(false);

    var created = pieceService.createPiece(user, createRequestDto);

    PieceDto piece = pieceService.getPieceById(user, created.getId());
    assertFalse(piece.getIsPublic());
    assertEquals(createRequestDto.getTitle(), piece.getTitle());

    PiecePermission permission =
        piecePermissionRepository
            .findByPieceIdAndUserId(created.getId(), user.getId())
            .orElseThrow();
    assertEquals(PermissionType.OWNER, permission.getPermissionType());

    getMessageAsserter()
        .assertSendToUser(
            user.getId(),
            GeneralPieceNowAvailableEvent.class,
            payload -> assertEquals(created.getId(), payload.piece().getId()));
  }

  @Test
  void testUpdatePiecePublicToPublic() {
    User user = persistUser();
    Piece piece = persistPiece(true);
    persistPermission(piece, user, PermissionType.OWNER);

    pieceService.updatePiece(user, piece.getId(), createUpdateRequest(true));

    PieceDto updated = pieceService.getPieceById(user, piece.getId());
    assertEquals("Updated title", updated.getTitle());
    assertTrue(updated.getIsPublic());

    getMessageAsserter()
        .assertSend(
            Destinations.topicPiece(piece.getId()),
            PieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
    getMessageAsserter()
        .assertSend(
            Destinations.topicGeneral(),
            GeneralPieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
  }

  @Test
  void testUpdatePiecePrivateToPrivate() {
    User owner = persistUser();
    User collaborator = persistUser();
    Piece piece = persistPiece(false);
    persistPermission(piece, owner, PermissionType.OWNER);
    persistPermission(piece, collaborator, PermissionType.EDITOR);

    pieceService.updatePiece(owner, piece.getId(), createUpdateRequest(false));

    PieceDto updated = pieceService.getPieceById(owner, piece.getId());
    assertEquals("Updated title", updated.getTitle());
    assertFalse(updated.getIsPublic());

    getMessageAsserter()
        .assertSend(
            Destinations.topicPiece(piece.getId()),
            PieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
    getMessageAsserter()
        .assertSendToUsers(
            Set.of(owner.getId(), collaborator.getId()),
            GeneralPieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
  }

  @Test
  void testUpdatePiecePrivateToPublic() {
    User owner = persistUser();
    User collaborator = persistUser();
    Piece piece = persistPiece(false);
    persistPermission(piece, owner, PermissionType.OWNER);
    persistPermission(piece, collaborator, PermissionType.READER);

    pieceService.updatePiece(owner, piece.getId(), createUpdateRequest(true));

    PieceDto updated = pieceService.getPieceById(owner, piece.getId());
    assertEquals("Updated title", updated.getTitle());
    assertTrue(updated.getIsPublic());

    getMessageAsserter()
        .assertSend(
            Destinations.topicPiece(piece.getId()),
            PieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
    getMessageAsserter()
        .assertSend(
            Destinations.topicGeneral(),
            GeneralPieceNowAvailableEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
    getMessageAsserter()
        .assertSendToUsers(
            Set.of(owner.getId(), collaborator.getId()),
            GeneralPieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
  }

  @Test
  void testUpdatePiecePublicToPrivate() {
    User owner = persistUser();
    User collaborator = persistUser();
    Piece piece = persistPiece(true);
    persistPermission(piece, owner, PermissionType.OWNER);
    persistPermission(piece, collaborator, PermissionType.EDITOR);

    pieceService.updatePiece(owner, piece.getId(), createUpdateRequest(false));

    PieceDto updated = pieceService.getPieceById(owner, piece.getId());
    assertEquals("Updated title", updated.getTitle());
    assertFalse(updated.getIsPublic());

    getMessageAsserter()
        .assertSend(
            Destinations.topicPiece(piece.getId()),
            PieceMetadataUpdatedEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
    getMessageAsserter()
        .assertSend(
            Destinations.topicGeneral(),
            GeneralPieceNowUnavailableEvent.class,
            payload -> assertEquals(piece.getId(), payload.pieceId()));
    getMessageAsserter()
        .assertSendToUsers(
            Set.of(owner.getId(), collaborator.getId()),
            GeneralPieceNowAvailableEvent.class,
            payload -> assertEquals(piece.getId(), payload.piece().getId()));
  }

  // Helper methods

  private User persistUser() {
    return userRepository.saveAndFlush(TestUsers.createUser(UUID.randomUUID()));
  }

  private Piece persistPiece(boolean isPublic) {
    return pieceRepository.saveAndFlush(
        Piece.builder()
            .title("Piece")
            .composer("Composer")
            .year("2026")
            .description("Description")
            .difficulty("Easy")
            .bpmRange("60-80")
            .isPublic(isPublic)
            .build());
  }

  private void persistPermission(Piece piece, User user, PermissionType permissionType) {
    piecePermissionRepository.saveAndFlush(
        PiecePermission.builder().piece(piece).user(user).permissionType(permissionType).build());
  }

  private void persistRoomUser(Room room, User user) {
    roomUserRepository.saveAndFlush(RoomUser.builder().room(room).user(user).build());
  }

  private static PieceCreateRequestDto createPieceCreateRequest(boolean isPublic) {
    return PieceCreateRequestDto.builder()
        .title("Title")
        .composer("Composer")
        .year("2026")
        .description("Description")
        .difficulty("Easy")
        .bpmRange("60-80")
        .isPublic(isPublic)
        .build();
  }

  private static PieceUpdateRequestDto createUpdateRequest(boolean isPublic) {
    return new PieceUpdateRequestDto(
        "Updated title",
        "Updated composer",
        "2026",
        "Updated description",
        "Medium",
        "70-90",
        isPublic);
  }
}
