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

  private ScoreSheet getScoreSheetEntityById(final UUID pieceId, final UUID scoreSheetId) {
    return scoreSheetRepository
        .findByIdAndPieceId(scoreSheetId, pieceId)
        .orElseThrow(() -> new ObjectNotFoundException("Score sheet not found"));
  }

  private Section getSectionEntityById(final UUID pieceId, final UUID sectionId) {
    return sectionRepository
        .findByIdAndPieceId(sectionId, pieceId)
        .orElseThrow(() -> new ObjectNotFoundException("Section not found"));
  }

  private PiecePermission getPiecePermissionEntityByUserId(final UUID pieceId, final UUID userId) {
    return piecePermissionRepository
        .findByPieceIdAndUserId(pieceId, userId)
        .orElseThrow(() -> new ObjectNotFoundException("Piece permission not found"));
  }

  private User getUserEntityById(final UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ObjectNotFoundException("User not found"));
  }

  private void ensureNotSelfPermissionChange(final User actor, final UUID targetUserId) {
    if (actor.getId().equals(targetUserId)) {
      throw new BadRequestException("You cannot modify your own permission");
    }
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
  public void ensureReadableByUser(UUID userId, UUID pieceId) {
    User user = getUserEntityById(userId);
    Piece piece = getPieceEntityById(pieceId);
    ensureReadableByUser(user, piece);
  }

  @Override
  @Transactional
  public PieceDto createPiece(final User user, final PieceCreateRequestDto createRequestDto) {
    Piece piece = pieceMapper.toEntityFromCreateRequest(createRequestDto);
    piece = pieceRepository.save(piece);

    PiecePermission permission =
        PiecePermission.builder()
            .piece(piece)
            .user(user)
            .permissionType(PermissionType.OWNER)
            .build();
    piecePermissionRepository.save(permission);

    piece = getPieceEntityById(piece.getId()); // Reload to include permissions

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
   * Delete a piece and return the S3 keys of all score sheets that were associated with the piece
   * before deletion.
   *
   * @return a pair with list of S3 object keys to be deleted and a list of users that were
   *     permitted.
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

    Iterable<String> scoreSheetS3Keys =
        deletedPiece.getScoreSheets().stream().map(ScoreSheet::getS3Key).toList();
    for (String scoreSheetS3Key : scoreSheetS3Keys) {
      s3Service.deleteFile(scoreSheetS3Key);
    }
  }

  @Override
  @Transactional
  public void updatePiece(
      final User user, final UUID pieceId, final PieceUpdateRequestDto updateRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    boolean wasPublic = piece.isPublic();

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

    ScoreSheet scoreSheet = getScoreSheetEntityById(pieceId, updateRequestDto.scoreSheetId());
    UUID scoreSheetId = scoreSheet.getId();

    if (updateRequestDto.title() != null) {
      if (updateRequestDto.title().isBlank()) {
        throw new BadRequestException("Score sheet title must not be blank");
      }
      scoreSheet.setTitle(updateRequestDto.title());
    }

    if (updateRequestDto.position() != null) {
      List<ScoreSheet> orderedScoreSheets =
          new ArrayList<>(scoreSheetRepository.findAllByPieceIdOrderByPositionAsc(pieceId));
      int targetPosition = updateRequestDto.position();
      if (targetPosition < 0 || targetPosition >= orderedScoreSheets.size()) {
        throw new BadRequestException("Score sheet position is out of bounds");
      }

      orderedScoreSheets.removeIf(current -> current.getId().equals(scoreSheetId));
      orderedScoreSheets.add(targetPosition, scoreSheet);

      for (int index = 0; index < orderedScoreSheets.size(); index++) {
        orderedScoreSheets.get(index).setPosition(index);
      }
      scoreSheetRepository.saveAll(orderedScoreSheets);
    } else {
      scoreSheetRepository.save(scoreSheet);
    }

    ScoreSheet updatedScoreSheet = getScoreSheetEntityById(pieceId, scoreSheetId);
    ScoreSheetDto scoreSheetDto = scoreSheetMapper.toDto(updatedScoreSheet);
    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceScoreSheetUpdatedEvent(updatedScoreSheet.getId(), scoreSheetDto).asDto());
  }

  @Override
  @Transactional
  public void removeScoreSheet(
      final User user, final UUID pieceId, final PieceScoreSheetRemoveRequestDto removeRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    ScoreSheet scoreSheet = getScoreSheetEntityById(pieceId, removeRequestDto.scoreSheetId());

    sectionRepository.clearScoreSheetReferences(pieceId, scoreSheet.getId());

    List<ScoreSheet> orderedScoreSheets =
        new ArrayList<>(scoreSheetRepository.findAllByPieceIdOrderByPositionAsc(pieceId));
    orderedScoreSheets.removeIf(current -> current.getId().equals(scoreSheet.getId()));
    for (int index = 0; index < orderedScoreSheets.size(); index++) {
      orderedScoreSheets.get(index).setPosition(index);
    }
    scoreSheetRepository.saveAll(orderedScoreSheets);

    scoreSheetRepository.delete(scoreSheet);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceScoreSheetRemovedEvent(scoreSheet.getId()).asDto());

    s3Service.deleteFile(scoreSheet.getS3Key());
  }

  @Override
  @Transactional
  public void addSection(
      final User user, final UUID pieceId, final PieceSectionAddRequestDto addRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    List<Section> orderedSections =
        new ArrayList<>(sectionRepository.findAllByPieceIdOrderByPositionAsc(pieceId));

    int targetPosition = addRequestDto.position();
    if (targetPosition < 0 || targetPosition > orderedSections.size()) {
      throw new BadRequestException("Section position is out of bounds");
    }
    validateSectionName(addRequestDto.name());

    Section section = sectionMapper.toEntityFromCreateRequest(addRequestDto);
    section.setPiece(piece);

    if (addRequestDto.scoreSheetId() != null) {
      ScoreSheet scoreSheet = getScoreSheetEntityById(pieceId, addRequestDto.scoreSheetId());
      section.setScoreSheet(scoreSheet);
    }

    orderedSections.add(targetPosition, section);
    for (int index = 0; index < orderedSections.size(); index++) {
      orderedSections.get(index).setPosition(index);
    }

    List<Section> savedSections = sectionRepository.saveAll(orderedSections);
    Section createdSection = savedSections.get(targetPosition);

    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceSectionAddedEvent(sectionMapper.toDto(createdSection)).asDto());
  }

  private void ensurePermissionModificationAllowed(
      User user, UUID pieceId, UUID uuid, PermissionType permissionType) {
    if (uuid == null) {
      throw new BadRequestException("User id must be provided");
    }
    if (permissionType == null) {
      throw new BadRequestException("Permission type must be provided");
    }

    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER));
    ensureNotSelfPermissionChange(user, uuid);
  }

  @Override
  @Transactional
  public void addPermission(
      final User user, final UUID pieceId, final PiecePermissionAddRequestDto addRequestDto) {
    ensurePermissionModificationAllowed(
        user, pieceId, addRequestDto.userId(), addRequestDto.permissionType());
    Piece piece = getPieceEntityById(pieceId);

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
    piecePermissionRepository.save(permission);

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
    ensurePermissionModificationAllowed(
        user, pieceId, updateRequestDto.userId(), updateRequestDto.permissionType());

    PiecePermission permission =
        getPiecePermissionEntityByUserId(pieceId, updateRequestDto.userId());
    ensureOwnerWouldRemain(
        pieceId, permission.getPermissionType(), updateRequestDto.permissionType());

    permission.setPermissionType(updateRequestDto.permissionType());
    piecePermissionRepository.save(permission);

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
    ensurePermissionModificationAllowed(
        user, pieceId, removeRequestDto.userId(), PermissionType.READER);
    Piece piece = getPieceEntityById(pieceId);

    PiecePermission permission =
        getPiecePermissionEntityByUserId(pieceId, removeRequestDto.userId());
    ensureOwnerWouldRemain(pieceId, permission.getPermissionType(), null);
    piecePermissionRepository.delete(permission);

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

    Section section = getSectionEntityById(pieceId, updateRequestDto.sectionId());

    List<Section> orderedSections =
        new ArrayList<>(sectionRepository.findAllByPieceIdOrderByPositionAsc(pieceId));
    int currentPosition =
        orderedSections.stream().map(Section::getId).toList().indexOf(section.getId());
    if (currentPosition < 0) {
      throw new ObjectNotFoundException("Section not found");
    }

    int targetPosition = updateRequestDto.position();
    if (targetPosition < 0 || targetPosition >= orderedSections.size()) {
      throw new BadRequestException("Section position is out of bounds");
    }

    sectionMapper.updateEntityFromUpdateRequest(section, updateRequestDto);
    if (updateRequestDto.scoreSheetId() == null) {
      section.setScoreSheet(null);
    } else {
      ScoreSheet scoreSheet = getScoreSheetEntityById(pieceId, updateRequestDto.scoreSheetId());
      section.setScoreSheet(scoreSheet);
    }

    orderedSections.removeIf(current -> current.getId().equals(section.getId()));
    orderedSections.add(targetPosition, section);

    for (int index = 0; index < orderedSections.size(); index++) {
      orderedSections.get(index).setPosition(index);
    }

    sectionRepository.saveAll(orderedSections);

    Section updatedSection = getSectionEntityById(pieceId, section.getId());
    messagingService.send(
        Destinations.topicPiece(pieceId),
        new PieceSectionUpdatedEvent(updatedSection.getId(), sectionMapper.toDto(updatedSection))
            .asDto());
  }

  @Override
  @Transactional
  public void removeSection(
      final User user, final UUID pieceId, final PieceSectionRemoveRequestDto removeRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    Section section = getSectionEntityById(pieceId, removeRequestDto.sectionId());

    List<Section> orderedSections =
        new ArrayList<>(sectionRepository.findAllByPieceIdOrderByPositionAsc(pieceId));
    orderedSections.removeIf(current -> current.getId().equals(section.getId()));
    for (int index = 0; index < orderedSections.size(); index++) {
      orderedSections.get(index).setPosition(index);
    }
    sectionRepository.saveAll(orderedSections);

    sectionRepository.delete(section);

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

    Piece piece = getPieceEntityById(pieceId);
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

    List<ScoreSheetDto> scoreSheetDtos =
        scoreSheetMapper.toDtoList(scoreSheetRepository.saveAll(scoreSheets));

    scoreSheetDtos.forEach(
        scoreSheetDto ->
            messagingService.send(
                Destinations.topicPiece(pieceId),
                new PieceScoreSheetAddedEvent(scoreSheetDto).asDto()));

    return scoreSheetDtos;
  }
}
