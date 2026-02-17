const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Room {
  id: string;
  roomName: string;
}

export interface Message {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export async function createRoom(roomName: string): Promise<Room> {
  const res = await fetch(`${API_BASE}/api/v1/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const res = await fetch(`${API_BASE}/api/v1/rooms/${encodeURIComponent(roomId)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getMessages(
  roomId: string,
  pageNo = 0,
  pageSize = 50
): Promise<PageResponse<Message>> {
  const res = await fetch(
    `${API_BASE}/api/v1/rooms/${encodeURIComponent(roomId)}/messages?pageNo=${pageNo}&pageSize=${pageSize}`
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export function getWebSocketUrl(): string {
  const base = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/websocket";
  return `${base}/websocket`;
}
