import { Client, type messageCallbackType, StompConfig } from "@stomp/stompjs";

class StompService {
  private client: Client | null = null;

  connect(token: string, config?: Partial<StompConfig>) {
    console.log(
      "StompService: Connecting with token:",
      token.substring(0, 20) + "...",
    );
    this.client = new Client({
      brokerURL:
        (globalThis.location.protocol === "https:" ? "wss://" : "ws://") +
        globalThis.location.host +
        "/ws",
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("STOMP DEBUG:", str);
      },
      onConnect: () => {
        console.log("=== STOMP CONNECTED ===");
      },
      onDisconnect: () => {
        console.log("=== STOMP DISCONNECTED ===");
      },
      onStompError: (frame) => {
        console.error("=== STOMP ERROR ===", frame);
      },
      onWebSocketError: (error) => {
        console.error("=== WEBSOCKET ERROR ===", error);
      },
      ...config,
    });

    console.log("Calling client.activate()");
    this.client.activate();
  }

  async disconnect() {
    await this.client?.deactivate();
    this.client = null;
  }

  subscribe(destination: string, callback: messageCallbackType) {
    return this.client?.subscribe(destination, callback);
  }

  publish(destination: string, body: unknown) {
    this.client?.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const stompService = new StompService();
