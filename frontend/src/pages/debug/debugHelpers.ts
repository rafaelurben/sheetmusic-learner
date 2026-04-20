/*
 * (C) 2026. - Rafael Urben
 */

import { useEffect, useRef } from "react";

function usePrevious<T>(value: T, initialValue: T) {
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  // eslint-disable-next-line react-hooks/refs
  return ref.current;
}

/**
 * A drop-in replacement for {@link useEffect} that logs dependency changes.
 *
 * Source: https://stackoverflow.com/a/59843241/11912476
 * @param effectHook the actual hook function
 * @param dependencies the actual dependencies
 * @param dependencyNames optional array of dependency names
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function useEffectDebugger<T>(
  effectHook: (() => void) | (() => () => void),
  dependencies: T[],
  dependencyNames: string[] = [],
) {
  const previousDeps: T[] = usePrevious(dependencies, []);

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
        },
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log("[use-effect-debugger] ", changedDeps);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effectHook, dependencies);
}
