/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Utility class for managing destination names in the application. */
public class Destinations {
  public static final String USER_QUEUE_NOTIFICATIONS = "/queue/notifications";

  private static final Destination TOPIC_GENERAL = new Destination("/topic/general");

  private static final Pattern TOPIC_PIECE_DESTINATION_PATTERN =
      Pattern.compile(
          "^/topic/piece\\.(?<pieceId>[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
              + "[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$");

  private Destinations() {
    // Private constructor to prevent instantiation
  }

  public static Destination topicGeneral() {
    return TOPIC_GENERAL;
  }

  public static Destination topicRoom(UUID roomId) {
    return new Destination("/topic/room.%s".formatted(roomId.toString()));
  }

  public static Destination topicPiece(UUID pieceId) {
    return new Destination("/topic/piece.%s".formatted(pieceId.toString()));
  }

  public static Optional<UUID> extractPieceIdFromTopicPieceDestination(String destination) {
    if (destination == null || destination.isBlank()) {
      return Optional.empty();
    }

    Matcher matcher = TOPIC_PIECE_DESTINATION_PATTERN.matcher(destination);
    if (!matcher.matches()) {
      return Optional.empty();
    }

    return Optional.of(UUID.fromString(matcher.group("pieceId")));
  }
}
