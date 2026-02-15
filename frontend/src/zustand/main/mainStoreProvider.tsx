import React, { useState } from "react";
import {
  createMainStore,
  type MainStoreProps,
} from "@/zustand/main/mainStore.tsx";
import { MainStoreContext } from "@/zustand/main/mainStoreContext.tsx";

export function MainStoreProvider({
  children,
  ...props
}: React.PropsWithChildren<Partial<MainStoreProps>>) {
  const [store] = useState(() => createMainStore(props));
  return <MainStoreContext value={store}>{children}</MainStoreContext>;
}
