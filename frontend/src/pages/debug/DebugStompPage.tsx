/*
 * (C) 2026. - Rafael Urben
 */
import * as React from "react";
import { Button } from "@/shadcn/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { stompService } from "@/service/stompService.ts";
import type { PublishDestinationName } from "@/interfaces/PublishDestinationName.ts";
import type { RequestDto } from "@/interfaces/async/RequestDto.ts";
import { toast } from "sonner";

export default function DebugStompPage() {
  const [destination, setDestination] = React.useState("/app/room.dummy/chat");
  const [payload, setPayload] = React.useState(
    '{"message":"Hello from debug"}',
  );

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();

    if (!destination.trim()) {
      toast.error("Destination is required");
      return;
    }

    let parsedPayload: RequestDto;
    try {
      parsedPayload = JSON.parse(payload) as RequestDto;
    } catch {
      toast.error("Payload must be valid JSON");
      return;
    }

    try {
      stompService.publish(
        destination as PublishDestinationName,
        parsedPayload,
      );
      toast.success("Message sent");
    } catch (error) {
      console.error("Failed to publish STOMP message", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>STOMP Debug</CardTitle>
          <CardDescription>
            Send a raw STOMP payload to any application destination.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="debug-destination">Destination</Label>
              <Input
                id="debug-destination"
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value);
                }}
                placeholder="/app/room.{id}/chat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debug-payload">Payload (JSON)</Label>
              <Input
                id="debug-payload"
                value={payload}
                onChange={(event) => {
                  setPayload(event.target.value);
                }}
                placeholder='{"message":"Hi"}'
              />
            </div>
            <Button type="submit">Send message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
