import { Client, StompConfig, type StompSubscription } from "@stomp/stompjs";
import type { EventDto } from "@/interfaces/async/EventDto.ts";
import type { SubscribeDestinationName } from "@/interfaces/SubscribeDestinationName.ts";
import type { PublishDestinationName } from "@/interfaces/PublishDestinationName.ts";
import type { RequestDto } from "@/interfaces/async/RequestDto.ts";

type handlerType = (message: EventDto) => void;

class StompService {
  private client: Client | null = null;
  private readonly subscriptionMap = new Map<
    SubscribeDestinationName,
    {
      handlers: Map<string, handlerType>;
      subscription: StompSubscription | null;
    }
  >();
  private handlerIdCounter = 0;

  connect(token: string, config?: Partial<StompConfig>) {
    if (this.client?.connected) {
      throw new Error("StompService already connected");
    }

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
      onStompError: (frame) => {
        console.error("=== STOMP ERROR ===", frame);
      },
      onWebSocketError: (error) => {
        console.error("=== WEBSOCKET ERROR ===", error);
      },
      ...config,
      onConnect: (frame) => {
        console.log("=== STOMP CONNECTED ===");
        // Subscribe to all destinations that have handlers
        this.subscriptionMap.forEach((entry, destination) => {
          if (entry.handlers.size > 0 && !entry.subscription) {
            this.subscribeToDestination(destination);
          }
        });

        config?.onConnect?.(frame);
      },
      onDisconnect: (frame) => {
        console.log("=== STOMP DISCONNECTED ===");
        // Clear subscription references (they're invalid now)
        this.subscriptionMap.forEach((entry) => {
          entry.subscription = null;
        });

        config?.onDisconnect?.(frame);
      },
    });

    console.log("StompService: Calling client.activate()");
    this.client.activate();
  }

  async disconnect() {
    console.log("StompService: Disconnecting...");
    await this.client?.deactivate();
    // Clear all subscriptions
    this.subscriptionMap.forEach((entry) => {
      entry.subscription = null;
    });
  }

  private subscribeToDestination(destination: SubscribeDestinationName) {
    const entry = this.subscriptionMap.get(destination);
    if (!entry || entry.subscription) return;

    console.log(
      `StompService: Subscribing to destination: ${destination}`,
      this.client?.connected,
    );

    const subscription = this.client?.subscribe(destination, (message) => {
      const dto = JSON.parse(message.body) as EventDto;
      // Call all handlers for this destination
      entry.handlers.forEach((handler) => {
        handler(dto);
      });
    });

    if (subscription) {
      entry.subscription = subscription;
    }
  }

  private unsubscribeFromDestination(destination: SubscribeDestinationName) {
    const entry = this.subscriptionMap.get(destination);
    if (!entry?.subscription) return;

    entry.subscription.unsubscribe();
    entry.subscription = null;
  }

  /**
   * Adds a subscription handler for a specific destination. If the client is already connected, it will subscribe immediately.
   * Returns a handler ID that can be used to remove the subscription later.
   */
  addSubscription(
    destination: SubscribeDestinationName,
    callback: handlerType,
  ): string {
    // Get or create entry for this destination
    let entry = this.subscriptionMap.get(destination);
    if (!entry) {
      entry = {
        handlers: new Map(),
        subscription: null,
      };
      this.subscriptionMap.set(destination, entry);
    }

    // Generate unique handler ID
    const handlerId = `handler-${(++this.handlerIdCounter).toString()}`;
    entry.handlers.set(handlerId, callback);

    // If client is connected and no subscription exists yet, subscribe
    if (this.client?.connected && !entry.subscription) {
      this.subscribeToDestination(destination);
    }

    return handlerId;
  }

  /**
   * Removes a subscription handler for a specific destination using the handler ID returned by addSubscription.
   * If no more handlers remain for that destination, it will unsubscribe from the server.
   */
  removeSubscription(destination: SubscribeDestinationName, handlerId: string) {
    const entry = this.subscriptionMap.get(destination);
    if (!entry) return;

    // Remove the handler
    entry.handlers.delete(handlerId);

    // If no more handlers and client is connected, unsubscribe
    if (entry.handlers.size === 0 && this.client) {
      this.unsubscribeFromDestination(destination);
      // Clean up the entry
      this.subscriptionMap.delete(destination);
    }
  }

  /**
   * Send a message to the broker
   */
  publish(destination: PublishDestinationName, body: RequestDto) {
    if (!this.client?.connected) {
      throw new Error("StompService disconnected");
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const stompService = new StompService();
