/*
 * (C) 2026. - Rafael Urben
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// Keep tests isolated by resetting timers/mocks between test cases.
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
