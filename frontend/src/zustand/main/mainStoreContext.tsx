import { createContext, use } from "react";
import { useStore } from "zustand";
import {
  createMainStore,
  type MainStoreState,
} from "@/zustand/main/mainStore.tsx";

export const MainStoreContext = createContext<ReturnType<
  typeof createMainStore
> | null>(null);

export function useMainStoreSelect<T>(
  selector: (state: MainStoreState) => T,
): T {
  const store = use(MainStoreContext);
  if (!store) {
    throw new Error(
      "useMainStoreSelect must be used within a MainStoreProvider",
    );
  }
  return useStore(store, selector);
}

export function useMainStore(): MainStoreState {
  const store = use(MainStoreContext);
  if (!store) {
    throw new Error("useMainStore must be used within a MainStoreProvider");
  }
  return useStore(store);
}
