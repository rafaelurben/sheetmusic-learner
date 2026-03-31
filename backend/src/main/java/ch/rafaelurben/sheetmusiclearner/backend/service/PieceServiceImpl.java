/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.service;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PermissionType;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceCreateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.PieceDto;
import ch.rafaelurben.sheetmusiclearner.backend.api.dto.ScoreSheetDto;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.InsufficientPermissionException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.PieceMetadataDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.event.*;
import ch.rafaelurben.sheetmusiclearner.backend.io.async.dto.request.PieceUpdateRequestDto;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.PieceMapper;
import ch.rafaelurben.sheetmusiclearner.backend.io.mapper.ScoreSheetMapper;
import ch.rafaelurben.sheetmusiclearner.backend.model.Piece;
import ch.rafaelurben.sheetmusiclearner.backend.model.PiecePermission;
import ch.rafaelurben.sheetmusiclearner.backend.model.ScoreSheet;
import ch.rafaelurben.sheetmusiclearner.backend.model.User;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PiecePermissionRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.PieceRepository;
import ch.rafaelurben.sheetmusiclearner.backend.repository.ScoreSheetRepository;
import ch.rafaelurben.sheetmusiclearner.backend.utils.Destinations;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
  private final PieceMapper pieceMapper;
  private final ScoreSheetMapper scoreSheetMapper;
  private final S3Service s3Service;
  private final MessagingService messagingService;

  private static final String PNG_MEDIA_TYPE = "image/png";

  private Piece getPieceEntityById(final UUID pieceId) {
    return pieceRepository
        .findById(pieceId)
        .orElseThrow(() -> new ObjectNotFoundException("Piece not found"));
  }

  private void ensureReadableByUser(final User user, final Piece piece) {
    if (Boolean.TRUE.equals(piece.getIsPublic())) {
      return;
    }

    boolean hasPermission =
        piecePermissionRepository.existsByPieceIdAndUserId(piece.getId(), user.getId());
    if (!hasPermission) {
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

  private String createScoreSheetTitle(final MultipartFile file, final int position) {
    String originalFilename = file.getOriginalFilename();
    if (originalFilename == null || originalFilename.isBlank()) {
      return "Score Sheet " + (position + 1);
    }
    return originalFilename + " (" + position + ")";
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

  private String uploadToS3(final UUID pieceId, final UUID scoreSheetId, final MultipartFile file) {
    String s3Key = String.format("pieces/%s/sheets/%s.png", pieceId, scoreSheetId);

    return s3Service.uploadFile(s3Key, PNG_MEDIA_TYPE, file);
  }

  @Override
  @Transactional(readOnly = true)
  public List<PieceDto> getAllAccessiblePieces(final User user) {
    return pieceMapper.toDtoList(pieceRepository.findAccessibleByUserId(user.getId()));
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
    if (piece.getIsPublic()) {
      messagingService.send(
          Destinations.topicGeneral(), new GeneralPieceNowAvailableEvent(pieceMetadataDto).asDto());
    }
    // TODO: else send message to user

    return pieceMapper.toDto(piece);
  }

  @Override
  @Transactional(readOnly = true)
  public PieceDto getPieceById(final User user, final UUID pieceId) {
    Piece piece = getPieceEntityById(pieceId);
    ensureReadableByUser(user, piece);
    return pieceMapper.toDto(piece);
  }

  @Override
  @Transactional
  public void deletePiece(final User user, final UUID pieceId) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER));
    pieceRepository.delete(piece);

    messagingService.send(
        Destinations.topicGeneral(), new GeneralPieceNowUnavailableEvent(pieceId).asDto());
    messagingService.send(Destinations.topicPiece(pieceId), new PieceDeletedEvent().asDto());
  }

  @Override
  @Transactional
  public void updatePiece(
      final User user, final UUID pieceId, final PieceUpdateRequestDto updateRequestDto) {
    Piece piece = getPieceEntityById(pieceId);
    ensurePermissionType(user, piece, EnumSet.of(PermissionType.OWNER, PermissionType.EDITOR));

    pieceMapper.updateEntityFromUpdateRequest(piece, updateRequestDto);
    piece = pieceRepository.save(piece);

    PieceMetadataDto metadataDto = pieceMapper.toMetadataDto(piece);
    if (piece.getIsPublic()) {
      messagingService.send(
          Destinations.topicGeneral(), new GeneralPieceMetadataUpdatedEvent(metadataDto).asDto());
    }
    // TODO: else send message to permitted users
    messagingService.send(
        Destinations.topicPiece(pieceId), new PieceMetadataUpdatedEvent(metadataDto).asDto());
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
                  String s3Url = uploadToS3(pieceId, uuid, file);

                  return ScoreSheet.builder()
                      .id(uuid)
                      .piece(piece)
                      .position(position)
                      .title(createScoreSheetTitle(file, position))
                      .imageUrl(s3Url)
                      .build();
                })
            .toList();

    return scoreSheetMapper.toDtoList(scoreSheetRepository.saveAll(scoreSheets));
  }
}
