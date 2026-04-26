/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.testsupport;

import java.util.concurrent.ThreadLocalRandom;

public class RandomUtils {
  private RandomUtils() {}

  public static String string(final int minLen, final int maxLen) {
    ThreadLocalRandom random = ThreadLocalRandom.current();
    int length = random.nextInt(minLen, maxLen + 1);
    StringBuilder sb = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      char c = (char) random.nextInt(32, 127); // Printable ASCII
      sb.append(c);
    }
    return sb.toString();
  }
}
