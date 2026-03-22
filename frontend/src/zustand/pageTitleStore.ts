/*
 * (C) 2026. - Rafael Urben
 */
import { create } from "zustand";
import { useEffect } from "react";

interface PageTitleStoreState {
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
}

export const usePageTitleStore = create<PageTitleStoreState>()((set) => ({
  pageTitle: null,
  setPageTitle: (title) => {
    set({ pageTitle: title });
  },
}));

export function usePageTitle(title: string | null) {
  const setPageTitle = usePageTitleStore((state) => state.setPageTitle);

  useEffect(() => {
    setPageTitle(title);
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, title]);
}
