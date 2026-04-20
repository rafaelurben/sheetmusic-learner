/*
 * (C) 2026. - Rafael Urben
 */
import { useMemo } from "react";

/**
 * Get a list of objects sorted by their position attribute
 */
export function useSorted<T extends { position: number }>(objects?: T[]): T[] {
  return useMemo(
    () =>
      [...(objects ?? [])].sort(
        (left, right) => left.position - right.position,
      ),
    [objects],
  );
}
