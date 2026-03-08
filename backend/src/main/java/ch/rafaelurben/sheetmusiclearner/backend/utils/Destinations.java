/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

/** Utility class for managing destination names in the application. */
public class Destinations {
  public static final String TOPIC_GENERAL = "/topic/general";
  public static final DestinationBuilder TOPIC_ROOM = new DestinationBuilder("/topic/room.%s");
  public static final DestinationBuilder TOPIC_PIECE = new DestinationBuilder("/topic/piece.%s");

  private Destinations() {
    // Private constructor to prevent instantiation
  }

  public static class DestinationBuilder {
    private final String template;

    private DestinationBuilder(String template) {
      this.template = template;
    }

    public String with(Object... args) {
      return String.format(template, args);
    }
  }
}
