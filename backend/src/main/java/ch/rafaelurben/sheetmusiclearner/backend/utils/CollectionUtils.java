/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** Utilities for working with collections. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class CollectionUtils {

  public static <I, T extends WithId<I>> T findByIdOrThrow(
      final Collection<T> collection, final I id, final String errorMessage) {
    return collection.stream()
        .filter(item -> item.getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new ObjectNotFoundException(errorMessage));
  }

  public static <T extends WithPosition> T findByPositionOrThrow(
      final Collection<T> collection, final Integer position) {
    return collection.stream()
        .filter(item -> item.getPosition().equals(position))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Object with position not found"));
  }

  private static <T extends WithPosition> void sort(final List<T> list) {
    list.sort(Comparator.comparing(WithPosition::getPosition));
  }

  /**
   * Update the position of a positioned element in a modifiable list. Will also correct the
   * position of all other elements.
   */
  public static <I, T extends WithId<I> & WithPosition> void updatePosition(
      final List<T> list, final T target, final Integer newPosition) {
    if (newPosition >= list.size() || newPosition < 0) {
      throw new BadRequestException("Position out of bounds!");
    }

    sort(list);

    list.removeIf(current -> current.getId().equals(target.getId()));
    list.add(newPosition, target);

    for (int index = 0; index < list.size(); index++) {
      list.get(index).setPosition(index);
    }
  }

  /**
   * Remove a positioned element from a modifiable list. Will also correct the position of all other
   * elements.
   */
  public static <I, T extends WithId<I> & WithPosition> void removePositioned(
      final List<T> list, final T target) {
    sort(list);

    list.removeIf(current -> current.getId().equals(target.getId()));

    for (int index = 0; index < list.size(); index++) {
      list.get(index).setPosition(index);
    }
  }

  /**
   * Add a positioned element to a modifiable list. Will also correct the position of all other
   * elements.
   */
  public static <I, T extends WithId<I> & WithPosition> void addPositioned(
      final List<T> list, final T newObj, final Integer position) {
    if (position > list.size() || position < 0) {
      throw new BadRequestException("Position out of bounds!");
    }

    sort(list);

    list.add(position, newObj);

    for (int index = 0; index < list.size(); index++) {
      list.get(index).setPosition(index);
    }
  }
}
