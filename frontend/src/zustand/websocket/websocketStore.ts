// websocketStore.ts
import { create } from "zustand";

interface WebsocketState {
  connected: boolean;
  messages: Record<string, unknown[]>;
  addMessage: (topic: string, msg: unknown) => void;
  setConnected: (value: boolean) => void;
}

export const useWebsocketStore = create<WebsocketState>((set) => ({
  connected: false,
  messages: {},
  setConnected: (value) => {
    set({ connected: value });
  },
  addMessage: (topic, msg) => {
    set((state) => ({
      messages: {
        ...state.messages,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        [topic]: [...(state.messages[topic] || []), msg],
      },
    }));
  },
}));
