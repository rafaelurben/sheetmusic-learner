/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

/**
 * A type with an ID.
 *
 * @param <T> the ID type
 */
public interface WithId<T> {
  T getId();
}
