/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import static org.hibernate.Hibernate.initialize;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.*;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PiecePermissionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceScoreSheetRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceScoreSheetUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionAddRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionRemoveRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceSectionUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.PieceMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.ScoreSheetMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.SectionMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.UserMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import ch.rafaelurben.sheetmusiclearner.backend.model.PiecePermission;
import ch.rafaelurben.sheetmusiclearner.backend.model.ScoreSheet;
import ch.rafaelurben.sheetmusiclearner.backend.model.Section;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PiecePermissionRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PieceRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.RoomUserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.ScoreSheetRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.SectionRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.UserRepository;
import ch.rafaelurben.sheetmusiclearner.backend.utils.CollectionUtils;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.*;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class PieceServiceImpl implements PieceService {

  private final PieceRepository pieceRepository;
  private final PiecePermissionRepository piecePermissionRepository;
  private final ScoreSheetRepository scoreSheetRepository;
  private final SectionRepository sectionRepository;
  private final RoomUserRepository roomUserRepository;
  private final PieceMapper pieceMapper;
  private final ScoreSheetMapper scoreSheetMapper;
  private final SectionMapper sectionMapper;
  private final UserMapper userMapper;
  private final UserRepository userRepository;
  private final S3Service s3Service;
  private final MessagingService messagingService;

  @Lazy private final PieceServiceImpl thisProxy;

  private static final String PNG_MEDIA_TYPE = "image/png";

  private Piece getPieceEntityById(final UUID pieceId) {
    return pieceRepository
        .findById(pieceId)
        .orElseThrow(() -> new ObjectNotFoundException("Piece not found"));
  }

  private void ensureReadableByUser(final User user, final Piece piece) {
    if (piece.isPublic()) {
      return;
    }

    if (!piecePermissionRepository.existsByPieceIdAndUserId(piece.getId(), user.getId())
        && !roomUserRepository.existsByUserIdAndRoomPieceId(user.getId(), piece.getId())) {
      throw new InsufficientPermissionException("You do not have permission to view this piece");
    }
  }

  private void ensurePermissionType(
      final User user, final Piece piece, final Set<PermissionType> allowedPermissions) {
    boolean hasPermission =
        piecePermissionRepository.existsByPieceIdAndUserIdAndPermissionTypeIn(
            piece.getId(), user.getId(), allowedPermissions);
    if (!hasPermission) {
      throw new InsufficientPermissionException("You do not have permission to modify this piece");
    }
  }

  private int getNextScoreSheetPosition(final UUID pieceId) {
    return scoreSheetRepository.findMaxPositionByPieceId(pieceId).orElse(-1) + 1;
  }

  private ScoreSheet getScoreSheetEntityById(final Piece piece, final UUID scoreSheetId) {
    return CollectionUtils.findByIdOrThrow(
        piece.getScoreSheets(), scoreSheetId, "Score sheet not found");
  }

  private Section getSectionEntityById(final Piece piece, final UUID sectionId) {
    return CollectionUtils.findByIdOrThrow(piece.getSections(), sectionId, "Section not found");
  }

  private PiecePermission getPiecePermissionEntityByUserId(final Piece piece, final UUID userId) {
    return piece.getPermissions().stream()
        .filter(perm -> perm.getUser().getId().equals(userId))
        .findFirst()
        .orElseThrow(() -> new ObjectNotFoundException("Piece permission not found"));
  }

  private User getUserEntityById(final UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ObjectNotFoundException("User not found"));
  }

  private void ensureOwnerWouldRemain(
      final UUID pieceId,
      final PermissionType currentPermissionType,
      final PermissionType nextPermissionType) {
    boolean losingOwnerRole =
        currentPermissionType == PermissionType.OWNER && nextPermissionType != PermissionType.OWNER;
    if (!losingOwnerRole) {
      return;
    }

    long ownerCount =
        piecePermissionRepository.countByPieceIdAndPermissionType(pieceId, PermissionType.OWNER);
    if (ownerCount <= 1) {
      throw new BadRequestException("Piece must always have at least one owner");
    }
  }

  private String createScoreSheetTitle(final MultipartFile file, final int position) {
    String originalFilename = file.getOriginalFilename();
    if (originalFilename == null || originalFilename.isBlank()) {
      return "Score Sheet " + (position + 1);
    }
    return originalFilename + " (" + position + ")";
  }

  private void validateSectionName(final String sectionName) {
    if (sectionName == null || sectionName.isBlank()) {
      throw new BadRequestException("Section name must not be blank");
    }
  }

  private void validateScoreSheetTitle(final String sheetName) {
    if (sheetName == null || sheetName.isBlank()) {
      throw new BadRequestException("Scoresheet title must not be blank");
    }
  }

  private void validatePngFile(final MultipartFile file) {
    String contentType = file.getContentType();
    if (contentType == null || !contentType.equals(PNG_MEDIA_TYPE)) {
      throw new BadRequestException(
          String.format(
              "File '%s' is not a PNG image. Only PNG files are accepted.",
              file.getOriginalFilename()));
    }
  }

  private Collection<UUID> getPermittedUserIds(Piece piece) {
    return piece.getPermissions().stream().map(PiecePermission::getUser).map(User::getId).toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PieceMetadataDto> getAllAccessiblePieces(final User user) {
    return pieceMapper.toMetadataDtoList(pieceRepository.findAccessibleByUserId(user.getId()));
  }

  @Override
  @Transactional(readOnly = true)
  public void ensureReadableByUser(User user, UUID pieceId) {
    Piece piece = getPieceEntityById(pieceId);
    ensureReadableByUser(user, piece);
  }

  @Override
  public void ensureUserPermission(
      User user, UUID pieceId, Set<PermissionType> acceptablePermissions) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, acceptablePermissions);
  }

  @Override
  @Transactional
  public PieceDto createPiece(final User user, final PieceCreateRequestDto createRequestDto) {
    Piece piece = pieceMapper.toEntityFromCreateRequest(createRequestDto);
    PiecePermission permission =
        PiecePermission.builder()
            .piece(piece)
            .user(user)
            .permissionType(PermissionType.OWNER)
            .build();
    piece.setPermissions(List.of(permission));
    piece = pieceRepository.save(piece);

    PieceMetadataDto pieceMetadataDto = pieceMapper.toMetadataDto(piece);
    var dto = new GeneralPieceNowAvailableEvent(pieceMetadataDto).asDto();
    if (piece.isPublic()) {
      messagingService.send(Destinations.topicGeneral(), dto);
    } else {
      messagingService.sendToUser(user.getId(), dto);
    }

    return pieceMapper.toDto(piece);
  }

  @Override
  @Transactional(readOnly = true)
  public PieceDto getPieceById(final User user, final UUID pieceId) {
    Piece piece = getPieceEntityById(pieceId);
    ensureReadableByUser(user, piece);
    return pieceMapper.toDto(piece);
  }

  /**
   * Delete a piece.
   *
   * @return the deleted piece
   */
  @Transactional(rollbackFor = Exception.class)
  protected Piece deletePieceTransaction(final User user, final UUID pieceId) {
    Piece piece = getPieceEntityById(pieceId);
    initialize(piece.getScoreSheets()); // Ensure collection is loaded
    initialize(piece.getPermissions()); // Ensure collection is loaded

    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER));

    pieceRepository.delete(piece);
    pieceRepository.flush();

    return piece;
  }

  @Override
  public void deletePiece(final User user, final UUID pieceId) {
    Piece deletedPiece;
    try {
      deletedPiece = thisProxy.deletePieceTransaction(user, pieceId);
    } catch (DataIntegrityViolationException e) {
      log.warn(
          "Failed to delete piece with id {} due to data integrity violation: {}",
          pieceId,
          e.getMessage());
      throw new BadRequestException(
          "Cannot delete piece because it is still used in at least one room.");
    }

    Collection<UUID> permittedUsers = getPermittedUserIds(deletedPiece);

    if (deletedPiece.isPublic()) {
      messagingService.send(
          Destinations.topicGeneral(), new GeneralPieceNowUnavailableEvent(pieceId).asDto());
    } else {
      messagingService.sendToUsers(
          permittedUsers, new GeneralPieceNowUnavailableEvent(pieceId).asDto());
    }
    messagingService.send(Destinations.topicPiece(pieceId), new PieceDeletedEvent().asDto());
  }

  @Override
  @Transactional
  public void updatePiece(
      final User user, final UUID pieceId, final PieceUpdateRequestDto updateRequestDto) {
    Piece piece = getPieceEntityById(pieceId);

    boolean wasPublic = piece.isPublic();
    if (wasPublic != Boolean.TRUE.equals(updateRequestDto.isPublic())) {
      ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER));
    } else {
      ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));
    }

    pieceMapper.updateEntityFromUpdateRequest(piece, updateRequestDto);
    piece = pieceRepository.save(piece);

    PieceMetadataDto metadataDto = pieceMapper.toMetadataDto(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId), new PieceMetadataUpdatedEvent(metadataDto).asDto());

    if (wasPublic && !piece.isPublic()) { // public -> private
      messagingService.send(
          Destinations.topicGeneral(), new GeneralPieceNowUnavailableEvent(pieceId).asDto());
      messagingService.sendToUsers(
          getPermittedUserIds(piece), new GeneralPieceNowAvailableEvent(metadataDto).asDto());
    } else if (!wasPublic && piece.isPublic()) { // private -> public
      messagingService.send(
          Destinations.topicGeneral(), new GeneralPieceNowAvailableEvent(metadataDto).asDto());
      messagingService.sendToUsers(
          getPermittedUserIds(piece), new GeneralPieceMetadataUpdatedEvent(metadataDto).asDto());
    } else if (piece.isPublic()) { // public (no change)
      messagingService.send(
          Destinations.topicGeneral(), new GeneralPieceMetadataUpdatedEvent(metadataDto).asDto());
    } else if (!piece.isPublic()) { // private (no change)
      messagingService.sendToUsers(
          getPermittedUserIds(piece), new GeneralPieceMetadataUpdatedEvent(metadataDto).asDto());
    }
  }

  @Override
  @Transactional
  public void updateScoreSheet(
      final User user, final UUID pieceId, final PieceScoreSheetUpdateRequestDto updateRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    ScoreSheet scoreSheet = getScoreSheetEntityById(piece, updateRequestDto.scoreSheetId());

    if (updateRequestDto.title() != null) {
      validateScoreSheetTitle(updateRequestDto.title());
      scoreSheet.setTitle(updateRequestDto.title());
    }

    if (updateRequestDto.position() != null) {
      CollectionUtils.updatePosition(
          piece.getScoreSheets(), scoreSheet, updateRequestDto.position());
      pieceRepository.save(piece);
    } else {
      pieceRepository.save(piece);
    }

    ScoreSheetDto scoreSheetDto = scoreSheetMapper.toDto(scoreSheet);
    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceScoreSheetUpdatedEvent(scoreSheetDto.getId(), scoreSheetDto).asDto());
  }

  @Override
  @Transactional
  public void removeScoreSheet(
      final User user, final UUID pieceId, final PieceScoreSheetRemoveRequestDto removeRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    ScoreSheet scoreSheet = getScoreSheetEntityById(piece, removeRequestDto.scoreSheetId());

    sectionRepository.clearScoreSheetReferences(pieceId, scoreSheet.getId());

    CollectionUtils.removePositioned(piece.getScoreSheets(), scoreSheet);

    pieceRepository.save(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceScoreSheetRemovedEvent(scoreSheet.getId()).asDto());
  }

  @Override
  @Transactional
  public void addSection(
      final User user, final UUID pieceId, final PieceSectionAddRequestDto addRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    validateSectionName(addRequestDto.name());

    Section section = sectionMapper.toEntityFromCreateRequest(addRequestDto);
    section.setPiece(piece);

    if (addRequestDto.scoreSheetId() != null) {
      ScoreSheet scoreSheet = getScoreSheetEntityById(piece, addRequestDto.scoreSheetId());
      section.setScoreSheet(scoreSheet);
    }

    CollectionUtils.addPositioned(piece.getSections(), section, addRequestDto.position());
    piece = pieceRepository.save(piece);
    section = CollectionUtils.findByPositionOrThrow(piece.getSections(), addRequestDto.position());

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceSectionAddedEvent(sectionMapper.toDto(section)).asDto());
  }

  private void ensurePermissionModificationAllowed(
      User user, Piece piece, UUID userId, PermissionType permissionType) {
    if (userId == null) {
      throw new BadRequestException("User id must be provided");
    }
    if (permissionType == null) {
      throw new BadRequestException("Permission type must be provided");
    }

    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER));

    if (user.getId().equals(userId)) {
      throw new BadRequestException("You cannot modify your own permission");
    }
  }

  @Override
  @Transactional
  public void addPermission(
      final User user, final UUID pieceId, final PiecePermissionAddRequestDto addRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionModificationAllowed(
        user, piece, addRequestDto.userId(), addRequestDto.permissionType());

    User targetUser = getUserEntityById(addRequestDto.userId());
    boolean hasPermissionAlready =
        piecePermissionRepository.existsByPieceIdAndUserId(pieceId, targetUser.getId());
    if (hasPermissionAlready) {
      throw new BadRequestException("User already has permission for this piece");
    }

    PiecePermission permission =
        PiecePermission.builder()
            .piece(piece)
            .user(targetUser)
            .permissionType(addRequestDto.permissionType())
            .build();
    piece.getPermissions().add(permission);
    piece = pieceRepository.save(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PiecePermissionAddedEvent(userMapper.toDto(targetUser), addRequestDto.permissionType())
            .asDto());

    if (!piece.isPublic()) {
      messagingService.sendToUser(
          targetUser.getId(),
          new GeneralPieceNowAvailableEvent(pieceMapper.toMetadataDto(piece)).asDto());
    }
  }

  @Override
  @Transactional
  public void updatePermission(
      final User user, final UUID pieceId, final PiecePermissionUpdateRequestDto updateRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionModificationAllowed(
        user, piece, updateRequestDto.userId(), updateRequestDto.permissionType());

    PiecePermission permission = getPiecePermissionEntityByUserId(piece, updateRequestDto.userId());
    ensureOwnerWouldRemain(
        pieceId, permission.getPermissionType(), updateRequestDto.permissionType());

    permission.setPermissionType(updateRequestDto.permissionType());
    pieceRepository.save(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PiecePermissionUpdatedEvent(
                updateRequestDto.userId(), updateRequestDto.permissionType())
            .asDto());
  }

  @Override
  @Transactional
  public void removePermission(
      final User user, final UUID pieceId, final PiecePermissionRemoveRequestDto removeRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionModificationAllowed(
        user, piece, removeRequestDto.userId(), PermissionType.READER);

    PiecePermission permission = getPiecePermissionEntityByUserId(piece, removeRequestDto.userId());
    ensureOwnerWouldRemain(pieceId, permission.getPermissionType(), null);
    piece.getPermissions().remove(permission);
    pieceRepository.save(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PiecePermissionRemovedEvent(removeRequestDto.userId()).asDto());

    if (!piece.isPublic()) {
      messagingService.sendToUser(
          removeRequestDto.userId(), new GeneralPieceNowUnavailableEvent(piece.getId()).asDto());
    }
  }

  @Override
  @Transactional
  public void updateSection(
      final User user, final UUID pieceId, final PieceSectionUpdateRequestDto updateRequestDto) {
    if (updateRequestDto.sectionId() == null) {
      throw new BadRequestException("Section id must be provided");
    }
    validateSectionName(updateRequestDto.name());

    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    Section section = getSectionEntityById(piece, updateRequestDto.sectionId());
    if (!section.getPosition().equals(updateRequestDto.position())) {
      CollectionUtils.updatePosition(piece.getSections(), section, updateRequestDto.position());
    }

    if (updateRequestDto.scoreSheetId() == null) {
      section.setScoreSheet(null);
    } else {
      ScoreSheet scoreSheet = getScoreSheetEntityById(piece, updateRequestDto.scoreSheetId());
      section.setScoreSheet(scoreSheet);
    }

    sectionMapper.updateEntityFromUpdateRequest(section, updateRequestDto);

    pieceRepository.save(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceSectionUpdatedEvent(section.getId(), sectionMapper.toDto(section)).asDto());
  }

  @Override
  @Transactional
  public void removeSection(
      final User user, final UUID pieceId, final PieceSectionRemoveRequestDto removeRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    Section section = getSectionEntityById(piece, removeRequestDto.sectionId());

    CollectionUtils.removePositioned(piece.getSections(), section);
    pieceRepository.save(piece);

    messagingService.send(
        Destinations.topicPiece(pieceId), new PieceSectionRemovedEvent(section.getId()).asDto());
  }

  @Override
  @Transactional
  public List<ScoreSheetDto> uploadScoreSheets(
      final User user, final UUID pieceId, final List<MultipartFile> files) {
    if (files == null || files.isEmpty()) {
      throw new BadRequestException("At least one file must be provided");
    }

    final Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    int startPosition = getNextScoreSheetPosition(pieceId);
    List<MultipartFile> nonEmptyFiles =
        files.stream().filter(file -> file != null && !file.isEmpty()).toList();

    if (nonEmptyFiles.isEmpty()) {
      throw new BadRequestException("At least one non-empty file must be provided");
    }

    // Validate all files are PNG before uploading any
    for (MultipartFile file : nonEmptyFiles) {
      validatePngFile(file);
    }

    List<ScoreSheet> scoreSheets =
        IntStream.range(0, nonEmptyFiles.size())
            .mapToObj(
                index -> {
                  MultipartFile file = nonEmptyFiles.get(index);
                  UUID uuid = UUID.randomUUID();
                  int position = startPosition + index;

                  String s3Key = String.format("pieces/%s/sheets/%s.png", pieceId, uuid);
                  String s3Url = s3Service.uploadFile(s3Key, PNG_MEDIA_TYPE, file);

                  return ScoreSheet.builder()
                      .piece(piece)
                      .position(position)
                      .title(createScoreSheetTitle(file, position))
                      .s3Key(s3Key)
                      .imageUrl(s3Url)
                      .build();
                })
            .toList();

    piece.getScoreSheets().addAll(scoreSheets);
    Piece savedPiece = pieceRepository.save(piece);

    List<ScoreSheetDto> scoreSheetDtos =
        scoreSheetMapper.toDtoList(
            savedPiece.getScoreSheets().stream()
                .filter(s -> s.getPosition() >= startPosition)
                .toList());

    scoreSheetDtos.forEach(
        scoreSheetDto ->
            messagingService.send(
                Destinations.topicPiece(pieceId),
                new PieceScoreSheetAddedEvent(scoreSheetDto).asDto()));

    return scoreSheetDtos;
  }
}
