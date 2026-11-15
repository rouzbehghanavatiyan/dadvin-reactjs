import {
  HubConnectionBuilder,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken } from "../utils/authSession";
import type { ChatMessage } from "./index";

const baseURL = (
  import.meta.env?.VITE_URL || "http://171.22.25.222:9090/"
).replace(/\/+$/, "");

function readMessage(payload: unknown): ChatMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const senderId = Number(record.senderId ?? record.SenderId);
  const receiveId = Number(record.receiveId ?? record.ReceiveId);
  const text = String(record.text ?? record.Text ?? "").trim();
  const createdAt = String(record.createdAt ?? record.CreatedAt ?? "");
  const isRead = Boolean(record.isRead ?? record.IsRead);
  if (!id || !senderId || !text) return null;
  return { id, senderId, receiveId, text, isRead, createdAt };
}

export function connectChatHub(
  onMessage: (message: ChatMessage) => void,
): HubConnection | null {
  const token = getAccessToken();
  if (!token) return null;

  const connection = new HubConnectionBuilder()
    .withUrl(`${baseURL}/requestHub`, {
      accessTokenFactory: () => getAccessToken() ?? token,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveChatMessage", (payload: unknown) => {
    const message = readMessage(payload);
    if (message) onMessage(message);
  });

  return connection;
}
