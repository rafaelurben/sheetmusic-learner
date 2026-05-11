/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import ch.rafaelurben.sheetmusiclearner.backend.exceptions.BadRequestException;
import ch.rafaelurben.sheetmusiclearner.backend.exceptions.ObjectNotFoundException;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.junit.jupiter.api.Test;

class CollectionUtilsTest {

  @AllArgsConstructor
  @Data
  private static final class TestItem implements WithId<String>, WithPosition {
    private final String id;
    private Integer position;
  }

  @Test
  void testFindByIdOrThrow_whenFound() {
    List<TestItem> list = List.of(new TestItem("a", 0), new TestItem("b", 1));

    TestItem found = CollectionUtils.findByIdOrThrow(list, "b", "not found");

    assertEquals("b", found.getId());
  }

  @Test
  void testFindByIdOrThrow_whenNotFound() {
    List<TestItem> list = List.of(new TestItem("a", 0));

    ObjectNotFoundException ex =
        assertThrows(
            ObjectNotFoundException.class,
            () -> CollectionUtils.findByIdOrThrow(list, "missing", "oops"));

    assertEquals("oops", ex.getMessage());
  }

  @Test
  void testFindByPositionOrThrow_whenFound() {
    List<TestItem> list = List.of(new TestItem("a", 3), new TestItem("b", 5));

    TestItem found = CollectionUtils.findByPositionOrThrow(list, 5);

    assertEquals("b", found.getId());
  }

  @Test
  void testFindByPositionOrThrow_whenNotFound() {
    List<TestItem> list = List.of(new TestItem("a", 0));

    assertThrows(RuntimeException.class, () -> CollectionUtils.findByPositionOrThrow(list, 7));
  }

  @Test
  void testUpdatePosition_reordersAndResetsPositions() {
    ArrayList<TestItem> list =
        new ArrayList<>(List.of(new TestItem("a", 0), new TestItem("b", 1), new TestItem("c", 2)));

    TestItem target = list.get(2); // "c"

    CollectionUtils.updatePosition(list, target, 0);

    // after moving, target should be at index 0 and positions reset
    assertEquals(3, list.size());
    assertEquals("c", list.get(0).getId());
    assertEquals(Integer.valueOf(0), list.get(0).getPosition());
    assertEquals("a", list.get(1).getId());
    assertEquals(Integer.valueOf(1), list.get(1).getPosition());
    assertEquals("b", list.get(2).getId());
    assertEquals(Integer.valueOf(2), list.get(2).getPosition());
  }

  @Test
  void testUpdatePosition_outOfBounds_throws() {
    ArrayList<TestItem> list = new ArrayList<>(List.of(new TestItem("a", 0)));

    TestItem target = list.getFirst();

    assertThrows(BadRequestException.class, () -> CollectionUtils.updatePosition(list, target, 2));
    assertThrows(BadRequestException.class, () -> CollectionUtils.updatePosition(list, target, -1));
  }

  @Test
  void testRemovePositioned_removesAndResetsPositions() {
    ArrayList<TestItem> list =
        new ArrayList<>(List.of(new TestItem("a", 0), new TestItem("b", 1), new TestItem("c", 2)));

    TestItem toRemove = list.get(1); // "b"

    CollectionUtils.removePositioned(list, toRemove);

    assertEquals(2, list.size());
    assertEquals("a", list.get(0).getId());
    assertEquals(Integer.valueOf(0), list.get(0).getPosition());
    assertEquals("c", list.get(1).getId());
    assertEquals(Integer.valueOf(1), list.get(1).getPosition());
  }

  @Test
  void testAddPositioned_insertsAndResetsPositions() {
    ArrayList<TestItem> list = new ArrayList<>(List.of(new TestItem("a", 0), new TestItem("b", 1)));

    TestItem newItem = new TestItem("x", null);

    // insert at end (position == size) is allowed
    CollectionUtils.addPositioned(list, newItem, 2);

    assertEquals(3, list.size());
    assertEquals("x", list.get(2).getId());
    assertEquals(Integer.valueOf(2), list.get(2).getPosition());

    // inserting out of bounds should throw
    var yItem = new TestItem("y", null);
    assertThrows(BadRequestException.class, () -> CollectionUtils.addPositioned(list, yItem, 5));
    var zItem = new TestItem("z", null);
    assertThrows(BadRequestException.class, () -> CollectionUtils.addPositioned(list, zItem, -1));
  }
}
