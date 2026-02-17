import { Client, IMessage } from "@stomp/stompjs";

import SockJS from "sockjs-client";
import { type Message } from "./api";

let stompClient: Client | null = null;

export function connectStomp(
  roomId: string,
  onMessage: (msg: Message) => void,
  onConnect?: () => void,
  onError?: (error: string) => void
): Client {
  if (stompClient?.active) {
    stompClient.deactivate().catch(() => {});
  }
  stompClient = null;

  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/websocket"),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(`/topic/room/${roomId}`, (frame: IMessage) => {
        const message: Message = JSON.parse(frame.body);
        onMessage(message);
      });
      onConnect?.();
    },
    onStompError: (frame) => {
      onError?.(frame.headers["message"] || "Connection error");
    },
    onWebSocketError: () => {
      onError?.("WebSocket connection failed");
    },
  });

  client.activate();
  stompClient = client;
  return client;
}

export function sendMessage(
  roomId: string,
  sender: string,
  content: string
): void {
  if (!stompClient?.active) return;
  stompClient.publish({
    destination: `/app/sendMessage/${roomId}`,
    body: JSON.stringify({ sender, content }),
  });
}

export function disconnectStomp(): void {
  if (stompClient?.active) {
    stompClient.deactivate();
    stompClient = null;
  }
}
