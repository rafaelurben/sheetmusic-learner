/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

import java.util.UUID;

/** Utility class for managing destination names in the application. */
public class Destinations {
  public static final String USER_QUEUE_NOTIFICATIONS = "/queue/notifications";

  private static final Destination TOPIC_GENERAL = new Destination("/topic/general");

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
}
