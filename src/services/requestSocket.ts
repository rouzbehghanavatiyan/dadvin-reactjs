import {
  HubConnectionBuilder,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken } from "../utils/authSession";

export type IncomingClientRequest = {
  id: number;
  userId: number;
  domainId: number;
  requestText: string;
  filePath?: string | null;
};

const baseURL = (
  import.meta.env?.VITE_URL || "http://171.22.25.222:9090/"
).replace(/\/+$/, "");

function readRequest(payload: unknown): IncomingClientRequest | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const id = Number(record.id ?? record.Id);
  const userId = Number(record.userId ?? record.UserId);
  const domainId = Number(record.domainId ?? record.DomainId);
  const requestText = String(record.requestText ?? record.RequestText ?? "").trim();
  if (!id || !userId || !domainId || !requestText) return null;
  const files = record.files ?? record.Files;
  const firstFile = Array.isArray(files) ? files.find((item) => item && typeof item === "object") : undefined;
  const nestedPath = firstFile && typeof firstFile === "object"
    ? (firstFile as Record<string, unknown>).filePath ?? (firstFile as Record<string, unknown>).FilePath
    : undefined;
  const filePath = nestedPath ?? record.filePath ?? record.FilePath;
  return {
    id,
    userId,
    domainId,
    requestText,
    filePath: typeof filePath === "string" ? filePath : null,
  };
}

export function connectLawyerRequestHub(
  onRequest: (request: IncomingClientRequest) => void,
): HubConnection | null {
  const token = getAccessToken();
  if (!token) return null;

  const connection = new HubConnectionBuilder()
    .withUrl(`${baseURL}/requestHub`, {
      accessTokenFactory: () => getAccessToken() ?? token,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveClientRequest", (payload: unknown) => {
    const request = readRequest(payload);
    if (request) onRequest(request);
  });

  return connection;
}
